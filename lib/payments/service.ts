import "server-only"
import type { PoolClient } from "pg"
import { query, withTx } from "@/lib/db"
import { restoreOrderStock } from "@/lib/data/orders"
import { cardOrderExpiryMinutes, toMillimes } from "./config"
import { gatewayById, getGateway } from "./index"
import { PaymentError } from "./types"

export type SettleResult = "paid" | "pending" | "failed" | "not_card" | "not_found"

interface NewCardOrder {
  id: string
  number: string
  token: string
  total: number
}

/** Opens a hosted payment session for a freshly created card order and returns the URL to send the customer to. */
export async function startCardPayment(order: NewCardOrder, origin: string): Promise<string> {
  const amountMillimes = toMillimes(order.total)
  if (amountMillimes <= 0) throw new PaymentError("Montant de commande invalide.")

  const gateway = getGateway()
  const back = new URL("/api/payments/return", origin)
  back.searchParams.set("order", order.number)
  back.searchParams.set("k", order.token)
  const fail = new URL(back)
  fail.searchParams.set("result", "fail")

  const session = await gateway.createPayment({
    orderNumber: order.number,
    amountMillimes,
    returnUrl: back.toString(),
    failUrl: fail.toString(),
    description: `Commande ${order.number} - Elissar`,
  })

  await withTx(async (db) => {
    await db.query(
      `insert into payment_attempts (order_id, gateway, gateway_order_id, amount_millimes, raw)
       values ($1, $2, $3, $4, $5::jsonb)`,
      [order.id, gateway.id, session.gatewayOrderId, amountMillimes, JSON.stringify(session.raw ?? {})],
    )
    await db.query(`update orders set gateway_order_id = $1 where id = $2`, [session.gatewayOrderId, order.id])
  })
  return session.redirectUrl
}

/** Marks an unpaid card order as failed, cancels it and gives its stock back. Safe to call twice. */
async function failCardOrderTx(db: PoolClient, orderId: string) {
  const cur = await db.query(`select payment_status, status from orders where id = $1 for update`, [orderId])
  const o = cur.rows[0]
  if (!o || o.payment_status !== "unpaid") return false
  await db.query(`update orders set payment_status = 'failed' where id = $1`, [orderId])
  if (o.status !== "cancelled") {
    await db.query(`update orders set status = 'cancelled' where id = $1`, [orderId])
    await restoreOrderStock(db, orderId)
  }
  await db.query(
    `update payment_attempts set status = 'failed', updated_at = now() where order_id = $1 and status = 'pending'`,
    [orderId],
  )
  return true
}

export async function failCardOrder(orderId: string) {
  return withTx((db) => failCardOrderTx(db, orderId))
}

/**
 * Asks the gateway what happened to an order's latest payment session and updates the order.
 * This is the ONLY place an order becomes "paid" online — never because a browser landed on a URL.
 * Idempotent: the return route, the confirmation page and the reconciler can all call it.
 */
export async function settleOrder(number: string): Promise<SettleResult> {
  const found = await query(`select id, payment_method, payment_status from orders where number = $1`, [number])
  const order = found[0]
  if (!order) return "not_found"
  if (order.payment_method !== "card") return "not_card"
  if (order.payment_status === "paid") return "paid"
  if (order.payment_status !== "unpaid") return "failed"

  const [attempt] = await query(
    `select gateway, gateway_order_id, amount_millimes, status from payment_attempts
     where order_id = $1 order by created_at desc limit 1`,
    [order.id],
  )
  if (!attempt || attempt.status === "mismatch") return "pending"

  let result
  try {
    result = await gatewayById(attempt.gateway).getStatus(attempt.gateway_order_id)
  } catch (e) {
    console.error("[payments] status check failed", number, e)
    return "pending" // can't tell right now; try again later, never guess
  }

  return withTx<SettleResult>(async (db) => {
    const cur = await db.query(`select payment_status from orders where id = $1 for update`, [order.id])
    if (!cur.rows[0]) return "not_found"
    if (cur.rows[0].payment_status === "paid") return "paid"

    if (result.status === "paid") {
      const expected = Number(attempt.amount_millimes)
      if (result.amountMillimes !== undefined && result.amountMillimes !== expected) {
        // Money moved but not the amount we asked for: don't mark paid, don't auto-cancel, flag for a human.
        console.error("[payments] amount mismatch", number, { expected, got: result.amountMillimes })
        await db.query(
          `update payment_attempts set status = 'mismatch', raw = raw || $2::jsonb, updated_at = now()
           where order_id = $1 and gateway_order_id = $3`,
          [order.id, JSON.stringify(result.raw ?? {}), attempt.gateway_order_id],
        )
        return "pending"
      }
      // An admin may have cancelled the order while the customer was paying: it still becomes paid,
      // and shows as "cancelled + paid" so the admin can refund it or re-open it.
      await db.query(`update orders set payment_status = 'paid', paid_at = now() where id = $1`, [order.id])
      await db.query(
        `update payment_attempts set status = 'paid', raw = raw || $2::jsonb, updated_at = now()
         where order_id = $1 and gateway_order_id = $3`,
        [order.id, JSON.stringify(result.raw ?? {}), attempt.gateway_order_id],
      )
      return "paid"
    }
    if (result.status === "failed") {
      await failCardOrderTx(db, order.id)
      return "failed"
    }
    return "pending"
  })
}

/** The bank sent the customer to the "failed" URL and the gateway still says nothing final: the attempt is over. */
export async function abandonCardOrder(number: string): Promise<SettleResult> {
  const result = await settleOrder(number)
  if (result !== "pending") return result
  const [o] = await query(`select id from orders where number = $1`, [number])
  if (o) await failCardOrder(o.id)
  return "failed"
}

/**
 * Housekeeping for card orders left hanging (browser closed, bank page abandoned): re-check them with the
 * gateway, then cancel the ones still unpaid after CARD_ORDER_EXPIRY_MINUTES so their stock is released.
 * The expiry must stay longer than the gateway's own payment-session timeout.
 */
export async function reconcileStaleCardOrders(limit = 25) {
  const expiry = cardOrderExpiryMinutes()
  const rows = await query<{ number: string; age_minutes: string }>(
    `select o.number, extract(epoch from (now() - o.created_at)) / 60 as age_minutes
     from orders o
     where o.payment_method = 'card' and o.payment_status = 'unpaid' and o.status <> 'cancelled'
       and o.created_at < now() - interval '3 minutes'
       and not exists (select 1 from payment_attempts a where a.order_id = o.id and a.status = 'mismatch')
     order by o.created_at limit $1`,
    [limit],
  )
  const out = { checked: rows.length, paid: 0, expired: 0 }
  for (const r of rows) {
    const res = await settleOrder(r.number)
    if (res === "paid") out.paid++
    else if (res === "failed") out.expired++
    else if (res === "pending" && Number(r.age_minutes) > expiry) {
      const [o] = await query(`select id from orders where number = $1`, [r.number])
      if (o && (await failCardOrder(o.id))) out.expired++
    }
  }
  return out
}
