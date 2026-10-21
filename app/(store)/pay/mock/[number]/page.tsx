import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { mockPayAction } from "@/app/actions/mock-payment"
import { getOrderForConfirmation } from "@/lib/data/orders"
import { getSettings } from "@/lib/data/settings"
import { formatPrice } from "@/lib/format"
import { mockAllowed, paymentProvider } from "@/lib/payments/config"

export const metadata: Metadata = { title: "Paiement de test", robots: { index: false } }
export const dynamic = "force-dynamic"

/** Stand-in for the bank's hosted payment page while there is no real gateway. Never shown in production. */
export default async function MockPaymentPage({ params, searchParams }: { params: Promise<{ number: string }>; searchParams: Promise<{ k?: string }> }) {
  const [{ number }, { k }] = await Promise.all([params, searchParams])
  if (paymentProvider() !== "mock" || !mockAllowed() || !k) notFound()
  const [order, settings] = await Promise.all([getOrderForConfirmation(number, k), getSettings()])
  if (!order || order.payment_method !== "card" || order.payment_status !== "unpaid") notFound()

  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <p className="label-mono border border-border p-3 text-center text-muted-foreground">Paiement de test — aucun argent n&apos;est prélevé</p>
      <h1 className="font-display mt-8 text-4xl">Payer par carte</h1>
      <p className="mt-3 text-muted-foreground">Commande {order.number}</p>
      <p className="font-mono mt-6 text-3xl">{formatPrice(order.total, settings.currency)}</p>
      <p className="mt-6 text-sm text-muted-foreground">
        Cette page remplace la page de paiement de la banque pendant le développement. Choisissez le résultat à simuler.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <form action={mockPayAction.bind(null, number, k, "paid")}>
          <button type="submit" className="label-mono w-full bg-foreground py-5 text-background transition-opacity hover:opacity-90">Simuler un paiement réussi</button>
        </form>
        <form action={mockPayAction.bind(null, number, k, "failed")}>
          <button type="submit" className="label-mono w-full border border-foreground/30 py-5 transition-colors hover:border-foreground">Simuler un paiement refusé</button>
        </form>
      </div>
    </div>
  )
}
