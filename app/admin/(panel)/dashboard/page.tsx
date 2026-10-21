import Link from "next/link"
import { AlertTriangle, CheckCircle2, Clock, ShoppingBag, Shirt, Wallet } from "lucide-react"
import { adminListOrders, adminStats } from "@/lib/data/orders"
import { getSettings } from "@/lib/data/settings"
import { formatPrice } from "@/lib/format"
import { COLOR_LABEL } from "@/lib/constants"
import { OrdersTable } from "@/components/admin/orders-table"
import { PageHeader, StatCard, card } from "@/components/admin/ui"

export const metadata = { title: "Dashboard" }

export default async function DashboardPage() {
  const [stats, recent, settings] = await Promise.all([adminStats(), adminListOrders({ limit: 6 }), getSettings()])
  const cur = settings.currency
  const max = Math.max(1, ...stats.daily.map((d) => d.revenue))

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="Les chiffres clés d'Elissar." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={formatPrice(stats.revenue, cur)} hint={`${formatPrice(stats.revenue7d, cur)} in the last 7 days`} icon={Wallet} accent />
        <StatCard label="Orders" value={stats.orders.toLocaleString()} hint={`${stats.units} pieces sold`} icon={ShoppingBag} accent />
        <StatCard label="Pending" value={stats.pending.toLocaleString()} hint="Need a confirmation call" icon={Clock} />
        <StatCard label="Delivered" value={stats.delivered.toLocaleString()} icon={CheckCircle2} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className={`${card} p-5 lg:col-span-2`}>
          <div className="mb-5 flex items-center justify-between"><h2 className="font-medium">Revenue — last 14 days</h2><span className="text-xs text-foreground/40">{cur}</span></div>
          <div className="flex h-44 items-end gap-1.5" role="img" aria-label="Daily revenue for the last 14 days">
            {stats.daily.map((d) => (
              <div key={d.day} className="group relative flex h-full flex-1 flex-col justify-end">
                <div className="min-h-[3px] w-full rounded-t bg-foreground/80 transition-colors group-hover:bg-primary/90" style={{ height: `${Math.max(2, (d.revenue / max) * 100)}%`, opacity: d.revenue ? 1 : 0.15 }} />
                <div className="pointer-events-none absolute -top-9 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-primary px-2 py-1 text-xs text-primary-foreground group-hover:block">{d.day.slice(5)} · {formatPrice(d.revenue, cur)} · {d.orders} orders</div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-foreground/30"><span>{stats.daily[0]?.day.slice(5)}</span><span>{stats.daily.at(-1)?.day.slice(5)}</span></div>
        </div>

        <div className={`${card} p-5`}>
          <h2 className="mb-4 flex items-center gap-2 font-medium"><AlertTriangle className="size-4 text-foreground/60" />Low stock</h2>
          {stats.low.length === 0 ? <p className="text-sm text-foreground/40">Everything is stocked.</p> : (
            <ul className="space-y-3 text-sm">
              {stats.low.map((l, i) => (
                <li key={i} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-foreground/80">{l.name} <span className="text-foreground/40">· {COLOR_LABEL[l.color as "black" | "white"]} {l.size}</span></span>
                  <span className={l.stock === 0 ? "rounded border border-red-500/40 bg-red-500/10 px-1.5 py-0.5 text-xs text-red-400" : "rounded border border-foreground/20 px-1.5 py-0.5 text-xs"}>{l.stock === 0 ? "out" : l.stock}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className={`${card} p-5`}>
          <h2 className="mb-4 flex items-center gap-2 font-medium"><Shirt className="size-4 text-foreground/60" />Best sellers</h2>
          {stats.top.length === 0 ? <p className="text-sm text-foreground/40">No sales yet.</p> : (
            <ul className="space-y-3 text-sm">
              {stats.top.map((t) => <li key={t.name} className="flex justify-between gap-3"><span className="truncate text-foreground/80">{t.name}</span><span className="shrink-0 text-foreground/50">{t.units} sold</span></li>)}
            </ul>
          )}
        </div>
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-medium">Recent orders</h2><Link href="/admin/orders" className="text-sm text-foreground/60 hover:text-foreground">View all →</Link></div>
          <OrdersTable orders={recent} currency={cur} compact />
        </div>
      </div>
    </div>
  )
}
