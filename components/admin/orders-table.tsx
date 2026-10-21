import Link from "next/link"
import type { Order } from "@/lib/types"
import { formatDate, formatPrice } from "@/lib/format"
import { COLOR_LABEL } from "@/lib/constants"
import { Empty, StatusBadge, card } from "./ui"

export function OrdersTable({ orders, currency, compact }: { orders: Order[]; currency: string; compact?: boolean }) {
  if (orders.length === 0) return <Empty>No orders yet.</Empty>
  return (
    <div className={`${card} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-foreground/10 text-xs uppercase tracking-wide text-foreground/40">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              {!compact && <th className="px-4 py-3 font-medium">Items</th>}
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-foreground/5 last:border-0 hover:bg-foreground/[0.03]">
                <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="font-mono text-xs font-medium underline-offset-4 hover:underline">{o.number}</Link></td>
                <td className="px-4 py-3"><div className="text-foreground">{o.customer_name}</div><div className="text-xs text-foreground/40">{o.phone} · {o.city}</div></td>
                {!compact && (
                  <td className="px-4 py-3 text-foreground/60"><div className="max-w-[260px] truncate">{o.items.map((i) => `${i.product_name} (${COLOR_LABEL[i.color as "black" | "white"] ?? i.color} ${i.size}) ×${i.quantity}`).join(", ")}</div></td>
                )}
                <td className="px-4 py-3 font-medium">{formatPrice(o.total, currency)}</td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3 text-foreground/50">{formatDate(o.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
