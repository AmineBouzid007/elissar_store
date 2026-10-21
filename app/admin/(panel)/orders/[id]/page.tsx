import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, MessageCircle, Phone } from "lucide-react"
import { adminGetOrder } from "@/lib/data/orders"
import { getSettings } from "@/lib/data/settings"
import { COLOR_LABEL } from "@/lib/constants"
import { formatDateTime, formatPrice } from "@/lib/format"
import { OrderControls } from "@/components/admin/order-controls"
import { StatusBadge, card } from "@/components/admin/ui"

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [order, settings] = await Promise.all([adminGetOrder(id), getSettings()])
  if (!order) notFound()
  const cur = settings.currency
  const wa = `https://wa.me/216${order.phone}`

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground"><ArrowLeft className="size-4" />All orders</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-2xl font-semibold">{order.number}</h1>
        <StatusBadge status={order.status} />
        <span className="text-sm text-foreground/40">{formatDateTime(order.created_at)}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className={`${card} overflow-hidden`}>
            <ul className="divide-y divide-foreground/10">
              {order.items.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="size-14 shrink-0 overflow-hidden rounded-md bg-foreground/5">{i.image_url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={i.image_url} alt="" className="size-full object-cover" />}</div>
                    <div className="min-w-0"><p className="truncate font-medium">{i.product_name}</p><p className="text-sm text-foreground/50">{COLOR_LABEL[i.color as "black" | "white"] ?? i.color} · {i.size} · {formatPrice(i.price, cur)} × {i.quantity}</p></div>
                  </div>
                  <span className="shrink-0 font-medium">{formatPrice(i.price * i.quantity, cur)}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-2 border-t border-foreground/10 p-4 text-sm">
              <div className="flex justify-between text-foreground/60"><span>Subtotal</span><span>{formatPrice(order.subtotal, cur)}</span></div>
              <div className="flex justify-between text-foreground/60"><span>Delivery</span><span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping, cur)}</span></div>
              <div className="flex justify-between border-t border-foreground/10 pt-3 text-base font-semibold"><span>Collect on delivery</span><span>{formatPrice(order.total, cur)}</span></div>
            </div>
          </div>
          {order.notes && <div className={`${card} p-4 text-sm`}><p className="mb-1 text-xs uppercase tracking-wide text-foreground/40">Customer note</p>{order.notes}</div>}
        </div>

        <div className="space-y-4">
          <OrderControls id={order.id} status={order.status} payment={order.payment_status} />
          <div className={`${card} p-5 text-sm`}>
            <p className="mb-3 text-xs uppercase tracking-wide text-foreground/40">Customer</p>
            <p className="font-medium">{order.customer_name}</p>
            <p className="mt-1 text-foreground/60">{order.phone}</p>
            {order.email && <p className="text-foreground/60">{order.email}</p>}
            <div className="mt-4 flex gap-2">
              <a href={`tel:+216${order.phone}`} className="inline-flex items-center gap-2 rounded-lg border border-foreground/15 px-3 py-2 text-xs hover:bg-foreground/5"><Phone className="size-3.5" />Call</a>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-foreground/15 px-3 py-2 text-xs hover:bg-foreground/5"><MessageCircle className="size-3.5" />WhatsApp</a>
            </div>
          </div>
          <div className={`${card} p-5 text-sm`}>
            <p className="mb-3 text-xs uppercase tracking-wide text-foreground/40">Delivery address</p>
            <p>{order.address}</p>
            <p className="text-foreground/60">{order.city}, {order.governorate}{order.postal_code ? ` ${order.postal_code}` : ""}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
