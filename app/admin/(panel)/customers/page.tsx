import { adminCustomers } from "@/lib/data/orders"
import { getSettings } from "@/lib/data/settings"
import { formatDate, formatPrice } from "@/lib/format"
import { Empty, PageHeader, card } from "@/components/admin/ui"

export const metadata = { title: "Customers" }

export default async function CustomersPage() {
  const [customers, settings] = await Promise.all([adminCustomers(), getSettings()])
  return (
    <div>
      <PageHeader title="Customers" description="Built from orders, grouped by phone number." />
      {customers.length === 0 ? <Empty>No customers yet.</Empty> : (
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead><tr className="border-b border-foreground/10 text-xs uppercase tracking-wide text-foreground/40">
                <th className="px-4 py-3 font-medium">Customer</th><th className="px-4 py-3 font-medium">Contact</th><th className="px-4 py-3 font-medium">Location</th><th className="px-4 py-3 font-medium">Orders</th><th className="px-4 py-3 font-medium">Spent</th><th className="px-4 py-3 font-medium">Last order</th>
              </tr></thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.phone} className="border-b border-foreground/5 last:border-0 hover:bg-foreground/[0.03]">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-foreground/60"><div>{c.phone}</div>{c.email && <div className="text-xs text-foreground/40">{c.email}</div>}</td>
                    <td className="px-4 py-3 text-foreground/60">{c.city}, {c.governorate}</td>
                    <td className="px-4 py-3">{c.orders}</td>
                    <td className="px-4 py-3 font-medium">{formatPrice(c.spent, settings.currency)}</td>
                    <td className="px-4 py-3 text-foreground/50">{formatDate(c.last_order)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
