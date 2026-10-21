import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { LogoMark } from "@/components/brand/logo"
import { ClearCart } from "@/components/store/clear-cart"
import { getOrderForConfirmation } from "@/lib/data/orders"
import { getSettings } from "@/lib/data/settings"
import { COLOR_LABEL } from "@/lib/constants"
import { formatPrice } from "@/lib/format"
import { settleOrder } from "@/lib/payments/service"

export const metadata: Metadata = { title: "Commande confirmée", robots: { index: false } }
export const dynamic = "force-dynamic"

export default async function ConfirmationPage({ params, searchParams }: { params: Promise<{ number: string }>; searchParams: Promise<{ k?: string }> }) {
  const [{ number }, { k }] = await Promise.all([params, searchParams])
  if (!k) notFound()
  let [order, settings] = await Promise.all([getOrderForConfirmation(number, k), getSettings()])
  if (!order) notFound()
  // A card order that isn't marked paid yet (page reloaded, slow bank): ask the gateway again.
  if (order.payment_method === "card" && order.payment_status === "unpaid") {
    try {
      await settleOrder(number)
      order = (await getOrderForConfirmation(number, k)) ?? order
    } catch (e) {
      console.error("[confirmation] could not re-check payment", number, e)
    }
  }
  const cur = settings.currency
  const byCard = order.payment_method === "card"
  const awaitingPayment = byCard && order.payment_status === "unpaid"
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:py-24">
      {!awaitingPayment && <ClearCart />}
      <LogoMark className="mb-8 h-14 w-auto text-primary" />
      <p className="label-mono text-muted-foreground">Commande {order.number}</p>
      <h1 className="font-display mt-3 text-5xl sm:text-7xl">{awaitingPayment ? "Paiement en cours de vérification" : byCard ? "Paiement reçu" : "Commande reçue"}</h1>
      {awaitingPayment ? (
        <p className="mt-6 max-w-lg text-lg text-muted-foreground">
          Merci {order.customer_name.split(" ")[0]}. Nous vérifions votre paiement auprès de la banque. Rechargez cette page dans quelques instants : votre commande est conservée et rien ne sera débité deux fois.
        </p>
      ) : (
        <p className="mt-6 max-w-lg text-lg text-muted-foreground">
          Merci {order.customer_name.split(" ")[0]}.{byCard ? " Votre paiement par carte a bien été reçu." : ""} Nous vous appelons au <span className="text-foreground">{order.phone}</span> pour confirmer votre commande et la livraison.
        </p>
      )}

      <div className="mt-12 rounded-xl border border-border bg-card">
        <ul className="divide-y divide-border">
          {order.items.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-4 p-5">
              <div><p className="font-display text-base">{i.product_name}</p><p className="label-mono mt-1 text-muted-foreground">{COLOR_LABEL[i.color as "black" | "white"] ?? i.color} · {i.size} × {i.quantity}</p></div>
              <span className="font-mono text-sm">{formatPrice(i.price * i.quantity, cur)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-2 border-t border-border p-5 text-sm">
          <div className="flex justify-between text-muted-foreground"><span>Sous-total</span><span className="font-mono">{formatPrice(order.subtotal, cur)}</span></div>
          <div className="flex justify-between text-muted-foreground"><span>Livraison</span><span className="font-mono">{order.shipping === 0 ? "Offerte" : formatPrice(order.shipping, cur)}</span></div>
          <div className="flex justify-between pt-2"><span className="font-display text-lg">{byCard ? (awaitingPayment ? "Total" : "Payé par carte") : "À payer à la livraison"}</span><span className="font-mono text-lg">{formatPrice(order.total, cur)}</span></div>
        </div>
      </div>

      <div className="mt-6 border border-border p-5 text-sm">
        <p className="label-mono mb-2 text-muted-foreground">Livraison à</p>
        <p>{order.address}, {order.city}, {order.governorate}</p>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/shop" className="label-mono bg-foreground px-10 py-4 text-center text-background">Continuer mes achats</Link>
        <Link href="/track" className="label-mono border border-foreground/30 px-10 py-4 text-center hover:border-foreground">Suivre ma commande</Link>
      </div>
      <p className="label-mono mt-6 text-muted-foreground">Conservez votre numéro de commande : {order.number}</p>
    </div>
  )
}
