import type { Metadata } from "next"
import { getSettings } from "@/lib/data/settings"
import { formatPrice } from "@/lib/format"

export const metadata: Metadata = { title: "Livraison & retouches" }

export default async function ShippingPage() {
  const s = await getSettings()
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 lg:py-20">
      <p className="label-mono mb-3 text-muted-foreground">Aide</p>
      <h1 className="font-display text-5xl sm:text-7xl">Livraison &amp; retouches</h1>
      <div className="mt-12 space-y-10 text-lg leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-display mb-3 text-2xl text-foreground">Livraison</h2>
          <p>Nous livrons dans toute la Tunisie et expédions à l&apos;international. {s.shipping_fee > 0 ? `La livraison coûte ${formatPrice(s.shipping_fee, s.currency)}${s.free_shipping_threshold > 0 ? `, et elle est offerte dès ${formatPrice(s.free_shipping_threshold, s.currency)} d'achat` : ""}.` : "La livraison en Tunisie est offerte."}</p>
        </section>
        <section>
          <h2 className="font-display mb-3 text-2xl text-foreground">Paiement</h2>
          <p>Paiement à la livraison : vous réglez à la réception, rien n&apos;est débité en ligne. Après votre commande, nous vous appelons pour la confirmer.</p>
        </section>
        <section>
          <h2 className="font-display mb-3 text-2xl text-foreground">Retouches &amp; sur mesure</h2>
          <p>Retouche gratuite dans un délai de 30 jours. Pour une commande sur mesure, indiquez vos mensurations dans les notes de commande ou écrivez-nous sur WhatsApp : notre service client VIP ajuste la pièce pour vous.</p>
        </section>
      </div>
    </div>
  )
}
