import type { Metadata } from "next"
import { isDbConfigured } from "@/lib/db"
import { trackOrder } from "@/lib/data/orders"
import { getSettings } from "@/lib/data/settings"
import { COLOR_LABEL, ORDER_STATUSES, ORDER_STATUS_LABEL } from "@/lib/constants"
import { formatDate, formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Suivre ma commande" }

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ number?: string; phone?: string }> }) {
  const { number, phone } = await searchParams
  const searched = Boolean(number && phone)
  const order = searched && isDbConfigured() ? await trackOrder(number!, phone!) : null
  const settings = await getSettings()
  const steps = ORDER_STATUSES.filter((s) => s !== "cancelled")
  const idx = order ? steps.indexOf(order.status as (typeof steps)[number]) : -1

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 lg:py-20">
      <p className="label-mono mb-3 text-muted-foreground">Commandes</p>
      <h1 className="font-display text-5xl sm:text-7xl">Suivi</h1>
      <form className="mt-10 grid gap-4 sm:grid-cols-[1fr_1fr_auto]" action="/track">
        <input name="number" defaultValue={number} required placeholder="Numéro de commande (EL-1001)" aria-label="Numéro de commande" className="border border-border bg-transparent px-4 py-3.5 outline-none focus:border-foreground" />
        <input name="phone" defaultValue={phone} required inputMode="tel" placeholder="Téléphone utilisé à la commande" aria-label="Téléphone" className="border border-border bg-transparent px-4 py-3.5 outline-none focus:border-foreground" />
        <button className="label-mono bg-foreground px-8 py-3.5 text-background">Rechercher</button>
      </form>

      {searched && !order && <p className="mt-10 border border-border p-6 text-muted-foreground">Aucune commande trouvée. Vérifiez le numéro de commande et le téléphone.</p>}

      {order && (
        <div className="mt-10 border border-border">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
            <div><p className="font-display text-xl">{order.number}</p><p className="label-mono mt-1 text-muted-foreground">{formatDate(order.created_at)}</p></div>
            <span className={cn("label-mono px-3 py-1.5", order.status === "cancelled" ? "border border-destructive text-destructive" : "bg-foreground text-background")}>{ORDER_STATUS_LABEL[order.status]}</span>
          </div>
          {order.status !== "cancelled" && (
            <ol className="grid grid-cols-4 gap-2 border-b border-border p-5">
              {steps.map((s, i) => (
                <li key={s}>
                  <div className={cn("h-0.5", i <= idx ? "bg-foreground" : "bg-border")} />
                  <p className={cn("label-mono mt-2", i <= idx ? "text-foreground" : "text-muted-foreground")}>{ORDER_STATUS_LABEL[s]}</p>
                </li>
              ))}
            </ol>
          )}
          <ul className="divide-y divide-border">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4 p-5">
                <div><p className="font-display">{i.product_name}</p><p className="label-mono mt-1 text-muted-foreground">{COLOR_LABEL[i.color as "black" | "white"] ?? i.color} · {i.size} × {i.quantity}</p></div>
                <span className="font-mono text-sm">{formatPrice(i.price * i.quantity, settings.currency)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-border p-5"><span className="font-display text-lg">Total (paiement à la livraison)</span><span className="font-mono text-lg">{formatPrice(order.total, settings.currency)}</span></div>
        </div>
      )}
    </div>
  )
}
