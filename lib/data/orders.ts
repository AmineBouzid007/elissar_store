import "server-only"
import { randomBytes } from "node:crypto"
import { z } from "zod"
import { query, withTx } from "@/lib/db"
import { COLORS, GOVERNORATES, MAX_QTY_PER_LINE, SIZES, type OrderStatus, type PaymentStatus } from "@/lib/constants"
import { computeShipping, getSettings } from "@/lib/data/settings"
import type { Order, OrderItem } from "@/lib/types"

export class OrderError extends Error {}

export const checkoutSchema = z.object({
  full_name: z.string().trim().min(2, "Entrez votre nom complet").max(120),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s.-]/g, ""))
    .refine((v) => /^(\+216|00216)?[2-9]\d{7}$/.test(v), "Entrez un numéro tunisien valide (8 chiffres)"),
  email: z.string().trim().email("Entrez un e-mail valide").or(z.literal("")).default(""),
  governorate: z.enum(GOVERNORATES, { errorMap: () => ({ message: "Choisissez votre gouvernorat" }) }),
  city: z.string().trim().min(2, "Entrez votre ville").max(80),
  address: z.string().trim().min(5, "Entrez votre adresse complète").max(240),
  postal_code: z.string().trim().max(10).default(""),
  notes: z.string().trim().max(500).default(""),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        size: z.enum(SIZES),
        color: z.enum(COLORS),
        quantity: z.number().int().min(1).max(MAX_QTY_PER_LINE),
      }),
    )
    .min(1, "Votre panier est vide")
    .max(30),
})
export type CheckoutInput = z.infer<typeof checkoutSchema>

export function normalizePhone(p: string) {
  return p.replace(/[\s.-]/g, "").replace(/^(\+216|00216)/, "")
}

export async function createOrder(input: CheckoutInput): Promise<{ number: string; token: string }> {
  const settings = await getSettings()
  if (!settings.store_open) throw new OrderError("La boutique est fermée pour le moment. Revenez bientôt.")

  // merge duplicate lines
  const merged = new Map<string, CheckoutInput["items"][number]>()
  for (const it of input.items) {
    const k = `${it.productId}|${it.size}|${it.color}`
    const prev = merged.get(k)
    merged.set(k, prev ? { ...prev, quantity: Math.min(prev.quantity + it.quantity, MAX_QTY_PER_LINE) } : it)
  }
  const lines = [...merged.values()]

  return withTx(async (db) => {
    let subtotal = 0
    const resolved: {
      variantId: string
      productId: string
      name: string
      size: string
      color: string
      price: number
      quantity: number
      image: string
    }[] = []

    for (const it of lines) {
      const { rows } = await db.query(
        `select v.id as variant_id, v.stock, p.id as product_id, p.name, p.price, p.images, p.images_by_color, p.is_active
         from variants v join products p on p.id = v.product_id
         where p.id = $1 and v.size = $2 and v.color = $3
         for update of v`,
        [it.productId, it.size, it.color],
      )
      const r = rows[0]
      if (!r || !r.is_active) throw new OrderError("Un article de votre panier n'est plus disponible.")
      if (r.stock < it.quantity) {
        throw new OrderError(
          r.stock <= 0
            ? `${r.name} (${it.color}, ${it.size}) just sold out.`
            : `Only ${r.stock} left of ${r.name} (${it.color}, ${it.size}).`,
        )
      }
      const price = Number(r.price)
      subtotal += price * it.quantity
      const img = (r.images_by_color?.[it.color]?.[0] as string | undefined) ?? (r.images?.[0] as string | undefined) ?? ""
      resolved.push({
        variantId: r.variant_id,
        productId: r.product_id,
        name: r.name,
        size: it.size,
        color: it.color,
        price,
        quantity: it.quantity,
        image: img,
      })
    }

    const shipping = computeShipping(subtotal, settings)
    const total = subtotal + shipping
    const token = randomBytes(6).toString("hex")

    const seq = await db.query(`select nextval('order_number_seq') as n`)
    const number = `EL-${seq.rows[0].n}`

    const ins = await db.query(
      `insert into orders (number, public_token, customer_name, phone, email, governorate, city, address,
         postal_code, notes, subtotal, shipping, total)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) returning id`,
      [
        number, token, input.full_name, normalizePhone(input.phone), input.email, input.governorate, input.city,
        input.address, input.postal_code, input.notes, subtotal, shipping, total,
      ],
    )
    const orderId = ins.rows[0].id
    for (const r of resolved) {
      await db.query(
        `insert into order_items (order_id, product_id, variant_id, product_name, size, color, price, quantity, image_url)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [orderId, r.productId, r.variantId, r.name, r.size, r.color, r.price, r.quantity, r.image],
      )
      await db.query(`update variants set stock = stock - $1 where id = $2`, [r.quantity, r.variantId])
    }
    return { number, token }
  })
}

function mapOrder(r: any, items: OrderItem[]): Order {
  return {
    id: r.id,
    number: r.number,
    customer_name: r.customer_name,
    phone: r.phone,
    email: r.email,
    governorate: r.governorate,
    city: r.city,
    address: r.address,
    postal_code: r.postal_code,
    notes: r.notes,
    subtotal: Number(r.subtotal),
    shipping: Number(r.shipping),
    total: Number(r.total),
    payment_method: "cod",
    payment_status: r.payment_status,
    status: r.status,
    created_at: new Date(r.created_at).toISOString(),
    items,
  }
}

function mapItem(r: any): OrderItem {
  return {
    id: r.id,
    product_id: r.product_id,
    product_name: r.product_name,
    size: r.size,
    color: r.color,
    price: Number(r.price),
    quantity: r.quantity,
    image_url: r.image_url,
  }
}

async function attachItems(rows: any[]): Promise<Order[]> {
  if (rows.length === 0) return []
  const items = await query(`select * from order_items where order_id = any($1::uuid[])`, [rows.map((r) => r.id)])
  return rows.map((r) => mapOrder(r, items.filter((i: any) => i.order_id === r.id).map(mapItem)))
}

export async function getOrderForConfirmation(number: string, token: string): Promise<Order | null> {
  const rows = await query(`select * from orders where number = $1 and public_token = $2`, [number, token])
  return (await attachItems(rows))[0] ?? null
}

export async function trackOrder(number: string, phone: string): Promise<Order | null> {
  const rows = await query(`select * from orders where upper(number) = upper($1) and phone = $2`, [
    number.trim(),
    normalizePhone(phone),
  ])
  return (await attachItems(rows))[0] ?? null
}

// ---------- admin ----------
export async function adminListOrders(opts: { status?: string; q?: string; limit?: number } = {}): Promise<Order[]> {
  const where: string[] = []
  const params: unknown[] = []
  if (opts.status && opts.status !== "all") {
    params.push(opts.status)
    where.push(`status = $${params.length}`)
  }
  if (opts.q) {
    params.push(`%${opts.q.trim()}%`)
    where.push(`(number ilike $${params.length} or customer_name ilike $${params.length} or phone ilike $${params.length} or city ilike $${params.length})`)
  }
  const rows = await query(
    `select * from orders ${where.length ? "where " + where.join(" and ") : ""} order by created_at desc limit ${opts.limit ?? 200}`,
    params,
  )
  return attachItems(rows)
}

export async function adminGetOrder(id: string): Promise<Order | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const rows = await query(`select * from orders where id = $1`, [id])
  return (await attachItems(rows))[0] ?? null
}

export async function adminSetOrderStatus(id: string, status: OrderStatus) {
  await withTx(async (db) => {
    const cur = await db.query(`select status from orders where id = $1 for update`, [id])
    if (!cur.rows[0]) throw new OrderError("Order not found")
    const prev = cur.rows[0].status as OrderStatus
    if (prev === status) return
    // cancelling returns stock; un-cancelling takes it back (if available)
    if (status === "cancelled" && prev !== "cancelled") {
      await db.query(
        `update variants v set stock = v.stock + oi.quantity
         from order_items oi where oi.order_id = $1 and oi.variant_id = v.id`,
        [id],
      )
    } else if (prev === "cancelled" && status !== "cancelled") {
      const items = await db.query(
        `select oi.quantity, v.id as vid, v.stock from order_items oi join variants v on v.id = oi.variant_id where oi.order_id = $1 for update of v`,
        [id],
      )
      for (const it of items.rows) {
        if (it.stock < it.quantity) throw new OrderError("Not enough stock to re-open this order.")
      }
      for (const it of items.rows) await db.query(`update variants set stock = stock - $1 where id = $2`, [it.quantity, it.vid])
    }
    // delivered cash-on-delivery orders are paid
    if (status === "delivered") await db.query(`update orders set payment_status = 'paid' where id = $1 and payment_status = 'unpaid'`, [id])
    await db.query(`update orders set status = $1 where id = $2`, [status, id])
  })
}

export async function adminSetPaymentStatus(id: string, status: PaymentStatus) {
  await query(`update orders set payment_status = $1 where id = $2`, [status, id])
}

export async function adminDeleteOrder(id: string) {
  await withTx(async (db) => {
    const cur = await db.query(`select status from orders where id = $1 for update`, [id])
    if (!cur.rows[0]) return
    if (cur.rows[0].status !== "cancelled") {
      await db.query(
        `update variants v set stock = v.stock + oi.quantity
         from order_items oi where oi.order_id = $1 and oi.variant_id = v.id`,
        [id],
      )
    }
    await db.query(`delete from orders where id = $1`, [id])
  })
}

export interface CustomerRow {
  phone: string
  name: string
  email: string
  city: string
  governorate: string
  orders: number
  spent: number
  last_order: string
}

export async function adminCustomers(): Promise<CustomerRow[]> {
  const rows = await query(
    `select phone,
        (array_agg(customer_name order by created_at desc))[1] as name,
        (array_agg(email order by created_at desc))[1] as email,
        (array_agg(city order by created_at desc))[1] as city,
        (array_agg(governorate order by created_at desc))[1] as governorate,
        count(*) as orders,
        coalesce(sum(total) filter (where status <> 'cancelled'), 0) as spent,
        max(created_at) as last_order
     from orders group by phone order by max(created_at) desc`,
  )
  return rows.map((r: any) => ({
    phone: r.phone, name: r.name, email: r.email, city: r.city, governorate: r.governorate,
    orders: Number(r.orders), spent: Number(r.spent), last_order: new Date(r.last_order).toISOString(),
  }))
}

export async function adminStats() {
  const [tot] = await query(
    `select
       count(*) as orders,
       count(*) filter (where status = 'pending') as pending,
       count(*) filter (where status = 'delivered') as delivered,
       coalesce(sum(total) filter (where status <> 'cancelled'), 0) as revenue,
       coalesce(sum(total) filter (where status <> 'cancelled' and created_at > now() - interval '7 days'), 0) as revenue_7d
     from orders`,
  )
  const [units] = await query(
    `select coalesce(sum(oi.quantity),0) as units from order_items oi join orders o on o.id = oi.order_id where o.status <> 'cancelled'`,
  )
  const daily = await query(
    `select to_char(d, 'YYYY-MM-DD') as day,
        coalesce((select sum(total) from orders where status <> 'cancelled' and created_at::date = d), 0) as revenue,
        (select count(*) from orders where created_at::date = d) as orders
     from generate_series(current_date - interval '13 days', current_date, interval '1 day') d order by d`,
  )
  const top = await query(
    `select oi.product_name as name, sum(oi.quantity) as units, sum(oi.quantity * oi.price) as revenue
     from order_items oi join orders o on o.id = oi.order_id where o.status <> 'cancelled'
     group by oi.product_name order by units desc limit 5`,
  )
  const low = await query(
    `select p.name, v.size, v.color, v.stock from variants v join products p on p.id = v.product_id
     where p.is_active and v.stock <= 3 order by v.stock, p.name limit 10`,
  )
  return {
    orders: Number(tot.orders), pending: Number(tot.pending), delivered: Number(tot.delivered),
    revenue: Number(tot.revenue), revenue7d: Number(tot.revenue_7d), units: Number(units.units),
    daily: daily.map((d: any) => ({ day: d.day as string, revenue: Number(d.revenue), orders: Number(d.orders) })),
    top: top.map((t: any) => ({ name: t.name as string, units: Number(t.units), revenue: Number(t.revenue) })),
    low: low.map((l: any) => ({ name: l.name as string, size: l.size as string, color: l.color as string, stock: Number(l.stock) })),
  }
}
