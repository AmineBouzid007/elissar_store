"use client"

import Link from "next/link"
import { Minus, Plus, X } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { useCart } from "@/lib/cart-context"
import { COLOR_LABEL } from "@/lib/constants"
import { formatPrice } from "@/lib/format"
import { ProductImage } from "./product-image"

export function CartDrawer() {
  const c = useCart()
  const remaining = c.freeOver > 0 ? Math.max(0, c.freeOver - c.subtotal) : 0
  const progress = c.freeOver > 0 ? Math.min(100, (c.subtotal / c.freeOver) * 100) : 0

  return (
    <Sheet open={c.isOpen} onOpenChange={(o) => (o ? c.open() : c.close())}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 border-border bg-background p-0 sm:max-w-md [&>button]:hidden">
        <SheetTitle className="sr-only">Votre panier</SheetTitle>
        <SheetDescription className="sr-only">Articles de votre panier</SheetDescription>
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
          <span className="font-display text-xl">Panier ({c.count})</span>
          <button onClick={c.close} aria-label="Fermer le panier" className="-mr-2 p-2"><X className="size-5" /></button>
        </div>

        {c.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-5 text-center">
            <p className="font-display text-3xl">Votre panier est vide</p>
            <p className="max-w-[16rem] text-sm text-muted-foreground">Parcourez nos collections pour trouver votre pièce.</p>
            <Link href="/shop" onClick={c.close} className="label-mono bg-foreground px-8 py-4 text-background">Voir la boutique</Link>
          </div>
        ) : (
          <>
            {c.freeOver > 0 && (
              <div className="border-b border-border px-5 py-4">
                <p className="label-mono text-foreground/70">
                  {remaining > 0 ? `${formatPrice(remaining, c.currency)} away from free delivery` : "Livraison offerte"}
                </p>
                <div className="mt-3 h-px w-full bg-border"><div className="h-px bg-foreground transition-all" style={{ width: `${progress}%` }} /></div>
              </div>
            )}
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
              {c.items.map((i) => (
                <li key={`${i.productId}${i.size}${i.color}`} className="flex gap-4 py-5">
                  <Link href={`/product/${i.slug}`} onClick={c.close} className="block w-20 shrink-0">
                    <ProductImage src={i.image_url} alt={i.name} className="aspect-[4/5] w-full border border-border" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <p className="font-display text-sm leading-tight">{i.name}</p>
                      <button aria-label={`Retirer ${i.name}`} onClick={() => c.removeItem(i.productId, i.size, i.color)} className="-mr-1 -mt-1 p-1 text-muted-foreground hover:text-foreground">
                        <X className="size-4" />
                      </button>
                    </div>
                    <p className="label-mono mt-1.5 text-muted-foreground">{COLOR_LABEL[i.color]} · {i.size}</p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-border">
                        <button aria-label="Diminuer la quantité" className="p-2 hover:bg-accent" onClick={() => c.setQuantity(i.productId, i.size, i.color, i.quantity - 1)}><Minus className="size-3.5" /></button>
                        <span className="w-7 text-center font-mono text-sm">{i.quantity}</span>
                        <button aria-label="Augmenter la quantité" disabled={i.quantity >= i.max} className="p-2 hover:bg-accent disabled:opacity-30" onClick={() => c.setQuantity(i.productId, i.size, i.color, i.quantity + 1)}><Plus className="size-3.5" /></button>
                      </div>
                      <span className="font-mono text-sm">{formatPrice(i.price * i.quantity, c.currency)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="shrink-0 space-y-3 border-t border-border px-5 py-5">
              <div className="flex justify-between text-sm text-muted-foreground"><span>Sous-total</span><span className="font-mono">{formatPrice(c.subtotal, c.currency)}</span></div>
              <div className="flex justify-between text-sm text-muted-foreground"><span>Livraison</span><span className="font-mono">{c.shipping === 0 ? "Offerte" : formatPrice(c.shipping, c.currency)}</span></div>
              <div className="flex justify-between border-t border-border pt-3"><span className="font-display text-lg">Total</span><span className="font-mono text-lg">{formatPrice(c.total, c.currency)}</span></div>
              <Link href="/checkout" onClick={c.close} className="label-mono mt-2 block bg-foreground py-4 text-center text-background transition-opacity hover:opacity-90">Commander — paiement à la livraison</Link>
              <Link href="/cart" onClick={c.close} className="label-mono block py-2 text-center text-muted-foreground hover:text-foreground">Voir le panier</Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
