"use client"

import Link from "next/link"
import { Minus, Plus, X } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { COLOR_LABEL } from "@/lib/constants"
import { formatPrice } from "@/lib/format"
import { ProductImage } from "./product-image"

export function CartPageView() {
  const c = useCart()
  if (c.ready && c.items.length === 0) {
    return (
      <div className="mx-auto max-w-[1400px] px-5 py-32 text-center lg:px-10">
        <h1 className="font-display text-5xl sm:text-7xl">Votre panier est vide</h1>
        <Link href="/shop" className="label-mono mt-10 inline-block bg-foreground px-10 py-5 text-background">Voir la boutique</Link>
      </div>
    )
  }
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12 lg:px-10 lg:py-16">
      <h1 className="font-display mb-10 text-5xl sm:text-7xl">Panier</h1>
      <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
        <ul className="divide-y divide-border border-y border-border">
          {c.items.map((i) => (
            <li key={`${i.productId}${i.size}${i.color}`} className="flex gap-5 py-6">
              <Link href={`/product/${i.slug}`} className="w-24 shrink-0 sm:w-32"><ProductImage src={i.image_url} alt={i.name} className="aspect-[4/5] w-full border border-border" /></Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <Link href={`/product/${i.slug}`} className="font-display text-lg leading-tight">{i.name}</Link>
                  <button aria-label={`Retirer ${i.name}`} onClick={() => c.removeItem(i.productId, i.size, i.color)} className="p-1 text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
                </div>
                <p className="label-mono mt-2 text-muted-foreground">{COLOR_LABEL[i.color]} · {i.size}</p>
                <p className="mt-1 font-mono text-sm text-muted-foreground">{formatPrice(i.price, c.currency)}</p>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex items-center border border-border">
                    <button aria-label="Diminuer la quantité" className="p-3 hover:bg-accent" onClick={() => c.setQuantity(i.productId, i.size, i.color, i.quantity - 1)}><Minus className="size-4" /></button>
                    <span className="w-8 text-center font-mono">{i.quantity}</span>
                    <button aria-label="Augmenter la quantité" disabled={i.quantity >= i.max} className="p-3 hover:bg-accent disabled:opacity-30" onClick={() => c.setQuantity(i.productId, i.size, i.color, i.quantity + 1)}><Plus className="size-4" /></button>
                  </div>
                  <span className="font-mono">{formatPrice(i.price * i.quantity, c.currency)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <aside className="h-fit border border-border p-6 lg:sticky lg:top-24">
          <h2 className="font-display mb-6 text-2xl">Récapitulatif</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Sous-total</span><span className="font-mono">{formatPrice(c.subtotal, c.currency)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Livraison</span><span className="font-mono">{c.shipping === 0 ? "Offerte" : formatPrice(c.shipping, c.currency)}</span></div>
          </div>
          <div className="mt-5 flex justify-between border-t border-border pt-5"><span className="font-display text-xl">Total</span><span className="font-mono text-xl">{formatPrice(c.total, c.currency)}</span></div>
          <Link href="/checkout" className="label-mono mt-6 block bg-foreground py-4 text-center text-background hover:opacity-90">Commander</Link>
          <p className="label-mono mt-4 text-center text-muted-foreground">Paiement à la livraison</p>
        </aside>
      </div>
    </div>
  )
}
