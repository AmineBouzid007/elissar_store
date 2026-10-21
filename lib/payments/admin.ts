import "server-only"
import { query } from "@/lib/db"
import { cardOrderExpiryMinutes, mockAllowed, paymentProvider, type PaymentProvider } from "./config"

export interface ConfigCheck {
  label: string
  ok: boolean
  /** required = must be set for card payments to work; otherwise it is only recommended */
  required: boolean
  hint: string
}

export interface PaymentSetup {
  provider: PaymentProvider
  cardEnabled: boolean
  /** plain-language state for the admin: why card payment is or isn't offered to customers */
  summary: string
  warnings: string[]
  checks: ConfigCheck[]
  expiryMinutes: number
}

const has = (name: string) => Boolean(process.env[name]?.trim())

/** What the admin can see about the payment setup. Reports whether each variable is set; never its value. */
export function getPaymentSetup(): PaymentSetup {
  const provider = paymentProvider()
  const warnings: string[] = []
  const checks: ConfigCheck[] = []
  let cardEnabled = false
  let summary = "Card payment is off. Customers can only choose cash on delivery."

  if (provider === "mock") {
    cardEnabled = mockAllowed()
    summary = cardEnabled
      ? "Test mode: customers see a fake payment page. No real money moves."
      : "Test mode is blocked on the live site, so card payment is hidden from customers."
    warnings.push(
      cardEnabled && process.env.VERCEL_ENV === "production"
        ? "Test payments are switched on for the live site (ALLOW_MOCK_PAYMENTS=true). Turn this off before real customers arrive."
        : "Test mode never charges a card. Use it to try the flow, not to take payments.",
    )
  }
  if (provider === "clictopay") {
    checks.push(
      { label: "CLICTOPAY_USERNAME", ok: has("CLICTOPAY_USERNAME"), required: true, hint: "From the bank (test, then live)" },
      { label: "CLICTOPAY_PASSWORD", ok: has("CLICTOPAY_PASSWORD"), required: true, hint: "From the bank (test, then live)" },
      { label: "CLICTOPAY_BASE_URL", ok: has("CLICTOPAY_BASE_URL"), required: true, hint: "Test address first, live address after approval" },
    )
    cardEnabled = has("CLICTOPAY_USERNAME") && has("CLICTOPAY_PASSWORD") && has("CLICTOPAY_BASE_URL")
    summary = cardEnabled
      ? "ClicToPay is on. Customers can pay by card on the bank's page."
      : "ClicToPay is selected but some bank settings are missing (see below), so card payment is hidden from customers."
    warnings.push("The ClicToPay connection has not been checked against the bank's documentation yet. Test with the bank's test account before going live.")
  }
  if (provider !== "none") {
    checks.push(
      { label: "CRON_SECRET", ok: has("CRON_SECRET"), required: false, hint: "Lets a scheduled job release stock from abandoned card orders" },
      { label: "PAYMENT_RETURN_BASE_URL", ok: has("PAYMENT_RETURN_BASE_URL"), required: false, hint: "Optional: the public site address the bank sends customers back to" },
    )
  }
  return { provider, cardEnabled, summary, warnings, checks, expiryMinutes: cardOrderExpiryMinutes() }
}

export interface PaymentTotals {
  paidCount: number
  paidAmount: number
  waiting: number
  failed: number
  needsReview: number
  cashOrders: number
  cardOrders: number
}

export async function paymentTotals(): Promise<PaymentTotals> {
  const [o] = await query(
    `select
       count(*) filter (where payment_method = 'card' and payment_status = 'paid') as paid_count,
       coalesce(sum(total) filter (where payment_method = 'card' and payment_status = 'paid'), 0) as paid_amount,
       count(*) filter (where payment_method = 'card' and payment_status = 'unpaid' and status <> 'cancelled') as waiting,
       count(*) filter (where payment_method = 'card' and payment_status = 'failed') as failed,
       count(*) filter (where payment_method = 'cod') as cash_orders,
       count(*) filter (where payment_method = 'card') as card_orders
     from orders`,
  )
  const [r] = await query(
    `select (
        select count(*) from payment_attempts where status = 'mismatch'
      ) + (
        select count(*) from orders where payment_method = 'card' and payment_status = 'paid' and status = 'cancelled'
      ) as needs_review`,
  )
  return {
    paidCount: Number(o.paid_count), paidAmount: Number(o.paid_amount), waiting: Number(o.waiting), failed: Number(o.failed),
    needsReview: Number(r.needs_review), cashOrders: Number(o.cash_orders), cardOrders: Number(o.card_orders),
  }
}

export interface PaymentRow {
  id: string
  created_at: string
  order_id: string
  order_number: string
  customer_name: string
  gateway: string
  gateway_order_id: string
  amount: number
  status: "pending" | "paid" | "failed" | "mismatch"
  /** the order was cancelled although the money arrived: refund or re-open */
  paid_but_cancelled: boolean
}

export async function listPayments(limit = 100): Promise<PaymentRow[]> {
  const rows = await query(
    `select a.id, a.created_at, a.order_id, o.number, o.customer_name, a.gateway, a.gateway_order_id,
            a.amount_millimes, a.status, (a.status = 'paid' and o.status = 'cancelled') as paid_but_cancelled
     from payment_attempts a join orders o on o.id = a.order_id
     order by a.created_at desc limit $1`,
    [limit],
  )
  return rows.map((r: any) => ({
    id: r.id,
    created_at: new Date(r.created_at).toISOString(),
    order_id: r.order_id,
    order_number: r.number,
    customer_name: r.customer_name,
    gateway: r.gateway,
    gateway_order_id: r.gateway_order_id,
    amount: Number(r.amount_millimes) / 1000,
    status: r.status,
    paid_but_cancelled: Boolean(r.paid_but_cancelled),
  }))
}
