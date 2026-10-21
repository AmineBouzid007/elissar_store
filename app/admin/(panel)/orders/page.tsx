import Link from "next/link"
import { Search } from "lucide-react"
import { adminListOrders } from "@/lib/data/orders"
import { isCardPaymentEnabled } from "@/lib/payments"
import { reconcileStaleCardOrders } from "@/lib/payments/service"
import { getSettings } from "@/lib/data/settings"
import { ORDER_STATUSES, ORDER_STATUS_LABEL } from "@/lib/constants"
import { OrdersTable } from "@/components/admin/orders-table"
import { PageHeader, inputCls } from "@/components/admin/ui"
import { cn } from "@/lib/utils"

export const metadata = { title: "Orders" }

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status = "all", q = "" } = await searchParams
  // best effort: re-check card orders left hanging and release the stock of expired ones
  if (isCardPaymentEnabled()) await reconcileStaleCardOrders().catch((e) => console.error("[orders] reconcile failed", e))
  const [orders, settings] = await Promise.all([adminListOrders({ status, q }), getSettings()])
  const tabs = ["all", ...ORDER_STATUSES]
  const href = (s: string) => `/admin/orders?${new URLSearchParams({ ...(s !== "all" ? { status: s } : {}), ...(q ? { q } : {}) })}`

  return (
    <div>
      <PageHeader title="Orders" description="Cash-on-delivery and card orders. Click an order to confirm, ship or cancel it." />
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((s) => (
            <Link key={s} href={href(s)} className={cn("rounded-lg border px-3.5 py-2 text-sm transition-colors", status === s ? "border-white bg-primary text-primary-foreground" : "border-foreground/10 text-foreground/60 hover:text-foreground")}>
              {s === "all" ? "All" : ORDER_STATUS_LABEL[s as keyof typeof ORDER_STATUS_LABEL]}
            </Link>
          ))}
        </div>
        <form className="relative w-full lg:max-w-xs">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/30" />
          <input name="q" defaultValue={q} placeholder="Search number, name, phone, city" className={cn(inputCls, "pl-9")} />
        </form>
      </div>
      <OrdersTable orders={orders} currency={settings.currency} />
    </div>
  )
}
