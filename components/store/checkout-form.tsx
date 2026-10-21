"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { Banknote, CreditCard } from "lucide-react"
import { toast } from "sonner"
import { placeOrderAction } from "@/app/actions/checkout"
import { useCart } from "@/lib/cart-context"
import { COLOR_LABEL, GOVERNORATES, type PaymentMethod } from "@/lib/constants"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { ProductImage } from "./product-image"

const PROFILE_KEY = "noct_profile_v1"
const field = "w-full border border-border bg-transparent px-4 py-3.5 text-base outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground"

export function CheckoutForm({ dbReady, storeOpen, cardEnabled, paymentFailed }: { dbReady: boolean; storeOpen: boolean; cardEnabled: boolean; paymentFailed: boolean }) {
  const c = useCart()
  const router = useRouter()
  const [pending, start] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [method, setMethod] = useState<PaymentMethod>("cod")
  const [redirecting, setRedirecting] = useState(false)
  const [form, setForm] = useState({
    full_name: "", phone: "", email: "", governorate: "Tunis", city: "", address: "", postal_code: "", notes: "", website: "",
  })

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY)
      if (raw) setForm((f) => ({ ...f, ...JSON.parse(raw), notes: "", website: "" }))
    } catch { /* ignore */ }
  }, [])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    start(async () => {
      const res = await placeOrderAction({
        ...form,
        payment_method: cardEnabled ? method : "cod",
        items: c.items.map((i) => ({ productId: i.productId, size: i.size, color: i.color, quantity: i.quantity })),
      })
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {})
        toast.error(res.error)
        return
      }
      try {
        const { notes: _n, website: _w, ...profile } = form
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
      } catch { /* ignore */ }
      if (res.redirectUrl) {
        // card payment: keep the cart until the payment is confirmed (it is cleared on the confirmation page)
        setRedirecting(true)
        window.location.assign(res.redirectUrl)
        return
      }
      c.clear()
      router.push(`/checkout/confirmation/${res.number}?k=${res.token}`)
    })
  }

  if (c.ready && c.items.length === 0) {
    return (
      <div className="mx-auto max-w-[1400px] px-5 py-32 text-center lg:px-10">
        <h1 className="font-display text-5xl sm:text-7xl">Votre panier est vide</h1>
        <Link href="/shop" className="label-mono mt-10 inline-block bg-foreground px-10 py-5 text-background">Voir la boutique</Link>
      </div>
    )
  }

  const err = (k: string) => errors[k] && <p role="alert" className="mt-1.5 text-xs text-destructive">{errors[k]}</p>

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12 lg:px-10 lg:py-16">
      <h1 className="font-display mb-10 text-5xl sm:text-7xl">Commander</h1>
      {!dbReady && <p className="label-mono mb-8 border border-border p-4 text-muted-foreground">Les commandes ne sont pas encore activées : la base de données n&apos;est pas connectée.</p>}
      {paymentFailed && <p role="alert" className="label-mono mb-8 border border-destructive p-4 text-destructive">Le paiement n&apos;a pas abouti et rien n&apos;a été débité. Vous pouvez réessayer ou choisir le paiement à la livraison.</p>}
      {!storeOpen && <p className="label-mono mb-8 border border-border p-4 text-muted-foreground">La boutique est fermée pour le moment. Les commandes reprendront bientôt.</p>}

      <form onSubmit={submit} className="grid gap-12 lg:grid-cols-[1fr_420px]" noValidate>
        <div className="space-y-12">
          <section>
            <h2 className="font-display mb-6 text-2xl">Coordonnées</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div><label htmlFor="full_name" className="label-mono mb-2 block text-muted-foreground">Nom et prénom</label><input id="full_name" autoComplete="name" required className={field} value={form.full_name} onChange={set("full_name")} />{err("full_name")}</div>
              <div><label htmlFor="phone" className="label-mono mb-2 block text-muted-foreground">Téléphone</label><input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="20 123 456" required className={field} value={form.phone} onChange={set("phone")} />{err("phone")}</div>
              <div className="sm:col-span-2"><label htmlFor="email" className="label-mono mb-2 block text-muted-foreground">E-mail (facultatif)</label><input id="email" type="email" autoComplete="email" className={field} value={form.email} onChange={set("email")} />{err("email")}</div>
            </div>
          </section>

          <section>
            <h2 className="font-display mb-6 text-2xl">Livraison</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="governorate" className="label-mono mb-2 block text-muted-foreground">Gouvernorat</label>
                <select id="governorate" className={cn(field, "appearance-none")} value={form.governorate} onChange={set("governorate")}>
                  {GOVERNORATES.map((g) => <option key={g} value={g} className="bg-background">{g}</option>)}
                </select>
                {err("governorate")}
              </div>
              <div><label htmlFor="city" className="label-mono mb-2 block text-muted-foreground">Ville</label><input id="city" autoComplete="address-level2" required className={field} value={form.city} onChange={set("city")} />{err("city")}</div>
              <div className="sm:col-span-2"><label htmlFor="address" className="label-mono mb-2 block text-muted-foreground">Adresse complète</label><input id="address" autoComplete="street-address" required className={field} value={form.address} onChange={set("address")} />{err("address")}</div>
              <div><label htmlFor="postal_code" className="label-mono mb-2 block text-muted-foreground">Code postal (facultatif)</label><input id="postal_code" autoComplete="postal-code" className={field} value={form.postal_code} onChange={set("postal_code")} /></div>
              <div className="sm:col-span-2"><label htmlFor="notes" className="label-mono mb-2 block text-muted-foreground">Notes ou mensurations (facultatif)</label><textarea id="notes" rows={3} placeholder="Repère, horaires de livraison, mesures pour une commande sur mesure…" className={field} value={form.notes} onChange={set("notes")} /></div>
              {/* honeypot */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} /></label></div>
            </div>
          </section>

          <section>
            <h2 className="font-display mb-6 text-2xl">Paiement</h2>
            <div role="radiogroup" aria-label="Mode de paiement" className="space-y-3">
              <label className={cn("flex cursor-pointer items-start gap-4 border p-5 transition-colors", method === "cod" || !cardEnabled ? "border-foreground" : "border-border hover:border-foreground/50")}>
                <input type="radio" name="payment_method" value="cod" checked={method === "cod" || !cardEnabled} onChange={() => setMethod("cod")} className="sr-only" />
                <Banknote className="mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="font-display text-base">Paiement à la livraison</p>
                  <p className="mt-1 text-sm text-muted-foreground">Vous payez en espèces à la réception de votre commande. Rien n&apos;est débité maintenant.</p>
                </div>
              </label>
              {cardEnabled && (
                <label className={cn("flex cursor-pointer items-start gap-4 border p-5 transition-colors", method === "card" ? "border-foreground" : "border-border hover:border-foreground/50")}>
                  <input type="radio" name="payment_method" value="card" checked={method === "card"} onChange={() => setMethod("card")} className="sr-only" />
                  <CreditCard className="mt-0.5 size-5 shrink-0" />
                  <div>
                    <p className="font-display text-base">Carte bancaire</p>
                    <p className="mt-1 text-sm text-muted-foreground">Vous êtes redirigée vers la page de paiement sécurisée de la banque. Nous ne voyons ni ne conservons les données de votre carte.</p>
                  </div>
                </label>
              )}
            </div>
          </section>
        </div>

        <aside className="h-fit border border-border p-6 lg:sticky lg:top-24">
          <h2 className="font-display mb-6 text-2xl">Votre commande</h2>
          <ul className="max-h-72 space-y-4 overflow-y-auto pr-1">
            {c.items.map((i) => (
              <li key={`${i.productId}${i.size}${i.color}`} className="flex items-center gap-4">
                <ProductImage src={i.image_url} alt={i.name} className="aspect-[4/5] w-14 shrink-0 border border-border" />
                <div className="min-w-0 flex-1">
                  <p className="font-display truncate text-sm">{i.name}</p>
                  <p className="label-mono mt-1 text-muted-foreground">{COLOR_LABEL[i.color]} · {i.size} × {i.quantity}</p>
                </div>
                <span className="font-mono text-sm">{formatPrice(i.price * i.quantity, c.currency)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Sous-total</span><span className="font-mono">{formatPrice(c.subtotal, c.currency)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Livraison</span><span className="font-mono">{c.shipping === 0 ? "Offerte" : formatPrice(c.shipping, c.currency)}</span></div>
          </div>
          <div className="mt-5 flex justify-between border-t border-border pt-5"><span className="font-display text-xl">Total</span><span className="font-mono text-xl">{formatPrice(c.total, c.currency)}</span></div>
          <button type="submit" disabled={pending || redirecting || !dbReady || !storeOpen} className="label-mono mt-6 w-full bg-foreground py-5 text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
            {redirecting ? "Redirection vers la banque…" : pending ? "Envoi en cours…" : method === "card" && cardEnabled ? "Payer par carte" : "Confirmer la commande"}
          </button>
          <p className="label-mono mt-4 text-center text-muted-foreground">
            {method === "card" && cardEnabled ? `Paiement sécurisé de ${formatPrice(c.total, c.currency)} par carte` : `Vous payez ${formatPrice(c.total, c.currency)} en espèces à la livraison`}
          </p>
        </aside>
      </form>
    </div>
  )
}
