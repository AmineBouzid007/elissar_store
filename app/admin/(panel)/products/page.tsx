import Link from "next/link"
import { Plus } from "lucide-react"
import { getProducts, productCover, totalStock } from "@/lib/data/catalog"
import { getSettings } from "@/lib/data/settings"
import { formatPrice } from "@/lib/format"
import { LOW_STOCK_THRESHOLD } from "@/lib/constants"
import { Empty, PageHeader, btnPrimary, card } from "@/components/admin/ui"
import { ActiveToggle } from "@/components/admin/active-toggle"

export const metadata = { title: "Products" }

export default async function ProductsPage() {
  const [products, settings] = await Promise.all([getProducts({ includeInactive: true }), getSettings()])
  return (
    <div>
      <PageHeader title="Products" description={`${products.length} product${products.length === 1 ? "" : "s"} in the catalog.`}
        action={<Link href="/admin/products/new" className={btnPrimary}><Plus className="size-4" />New product</Link>} />
      {products.length === 0 ? <Empty>No products yet.</Empty> : (
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead><tr className="border-b border-foreground/10 text-xs uppercase tracking-wide text-foreground/40">
                <th className="px-4 py-3 font-medium">Product</th><th className="px-4 py-3 font-medium">Category</th><th className="px-4 py-3 font-medium">Price</th><th className="px-4 py-3 font-medium">Stock</th><th className="px-4 py-3 font-medium">Visible</th>
              </tr></thead>
              <tbody>
                {products.map((p) => {
                  const stock = totalStock(p)
                  const img = productCover(p)
                  return (
                    <tr key={p.id} className="border-b border-foreground/5 last:border-0 hover:bg-foreground/[0.03]">
                      <td className="px-4 py-3">
                        <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                          <div className="size-11 shrink-0 overflow-hidden rounded-md bg-foreground/5">{img && /* eslint-disable-next-line @next/next/no-img-element */ <img src={img} alt="" className="size-full object-cover" />}</div>
                          <div><p className="font-medium hover:underline">{p.name}</p><p className="text-xs text-foreground/40">/{p.slug}</p></div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-foreground/60">{p.category_name ?? "—"}</td>
                      <td className="px-4 py-3 font-medium">{formatPrice(p.price, settings.currency)}</td>
                      <td className="px-4 py-3"><span className={stock <= LOW_STOCK_THRESHOLD ? "rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400" : "text-foreground/60"}>{stock}{stock === 0 ? " · sold out" : stock <= LOW_STOCK_THRESHOLD ? " · low" : ""}</span></td>
                      <td className="px-4 py-3"><ActiveToggle id={p.id} active={p.is_active} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
