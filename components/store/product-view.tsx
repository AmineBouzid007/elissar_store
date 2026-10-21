"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Check, Minus, Plus, Ruler, Truck } from "lucide-react"
import { toast } from "sonner"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { COLORS, COLOR_HEX, COLOR_LABEL, MAX_QTY_PER_LINE, SIZES, type Color, type Size } from "@/lib/constants"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/format"
import type { Product } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ProductImage } from "./product-image"

export function ProductView({ product, currency, freeOver, storeOpen }: { product: Product; currency: string; freeOver: number; storeOpen: boolean }) {
  const { addItem } = useCart()
  const stockOf = (color: Color, size: Size) => product.variants.find((v) => v.color === color && v.size === size)?.stock ?? 0

  const firstColor = COLORS.find((c) => SIZES.some((s) => stockOf(c, s) > 0)) ?? COLORS[0]
  const [color, setColor] = useState<Color>(firstColor)
  const [size, setSize] = useState<Size | null>(null)
  const [qty, setQty] = useState(1)
  const [active, setActive] = useState(0)

  const images = useMemo(() => {
    const byColor = product.images_by_color?.[color]
    return byColor && byColor.length ? byColor : product.images
  }, [product, color])

  const available = size ? stockOf(color, size) : 0
  const colorSold = SIZES.every((s) => stockOf(color, s) === 0)
  const onSale = product.compare_at_price && product.compare_at_price > product.price

  function add() {
    if (!size) return toast("Choisissez d'abord une taille")
    if (available <= 0) return toast("Cette taille est épuisée")
    addItem({
      productId: product.id, slug: product.slug, name: product.name, price: product.price,
      size, color, quantity: qty, image_url: images[0] ?? "", max: available,
    })
  }

  return (
    <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-8 lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:px-10 lg:py-12">
      {/* Gallery */}
      <div className="grid gap-3 lg:grid-cols-[84px_1fr]">
        <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col">
          {(images.length ? images : [""]).map((src, i) => (
            <button key={i} onClick={() => setActive(i)} aria-label={`Voir l'image ${i + 1}`}
              className={cn("w-20 shrink-0 border transition-colors lg:w-full", i === active ? "border-foreground" : "border-border opacity-60 hover:opacity-100")}>
              <ProductImage src={src} alt="" className="aspect-[4/5] w-full" />
            </button>
          ))}
        </div>
        <ProductImage src={images[active] ?? images[0]} alt={product.name} label={product.name} priority className="order-1 aspect-[4/5] w-full border border-border lg:order-2" />
      </div>

      {/* Buy box */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        {product.collection && <p className="label-mono mb-3 text-muted-foreground">{product.collection}</p>}
        <h1 className="font-display text-4xl sm:text-5xl">{product.name}</h1>
        <div className="mt-5 flex items-baseline gap-3 font-mono text-xl">
          {formatPrice(product.price, currency)}
          {onSale && <span className="text-base text-muted-foreground line-through">{formatPrice(product.compare_at_price!, currency)}</span>}
        </div>
        {product.description && <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>}

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <span className="label-mono">Couleur — <span className="text-muted-foreground">{COLOR_LABEL[color]}</span></span>
          </div>
          <div className="flex gap-3" role="radiogroup" aria-label="Couleur">
            {COLORS.map((c) => {
              const sold = SIZES.every((s) => stockOf(c, s) === 0)
              return (
                <button key={c} role="radio" aria-checked={color === c} aria-label={COLOR_LABEL[c]} onClick={() => { setColor(c); setSize(null); setActive(0); setQty(1) }}
                  className={cn("relative size-11 rounded-full border-2 p-0.5 transition-colors", color === c ? "border-foreground" : "border-border hover:border-foreground/50", sold && "opacity-40")}>
                  <span className="block size-full rounded-full border border-foreground/30" style={{ background: COLOR_HEX[c] }} />
                  {sold && <span className="absolute inset-0 flex items-center justify-center"><span className="h-px w-full rotate-45 bg-foreground/60" /></span>}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <span className="label-mono">Taille{size ? <span className="text-muted-foreground"> — {size}</span> : null}</span>
            <Link href="/size-guide" className="label-mono flex items-center gap-1.5 text-muted-foreground underline underline-offset-4 hover:text-foreground"><Ruler className="size-3.5" />Guide des tailles</Link>
          </div>
          <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Taille">
            {SIZES.map((s) => {
              const st = stockOf(color, s)
              return (
                <button key={s} role="radio" aria-checked={size === s} disabled={st <= 0} onClick={() => { setSize(s); setQty((q) => Math.min(q, st)) }}
                  className={cn("relative border py-4 font-mono text-sm transition-colors",
                    size === s ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/60",
                    st <= 0 && "cursor-not-allowed text-foreground/25 hover:border-border")}>
                  {s}
                  {st <= 0 && <span className="absolute inset-0 flex items-center justify-center"><span className="h-px w-3/4 -rotate-12 bg-foreground/25" /></span>}
                </button>
              )
            })}
          </div>
          {size && available > 0 && available <= 3 && <p className="label-mono mt-3 text-foreground">Only {available} left</p>}
          {colorSold && <p className="label-mono mt-3 text-muted-foreground">{COLOR_LABEL[color]} is sold out</p>}
        </div>

        <div className="mt-8 flex gap-3">
          <div className="flex items-center border border-border">
            <button aria-label="Diminuer la quantité" className="p-4 hover:bg-accent" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus className="size-4" /></button>
            <span className="w-8 text-center font-mono">{qty}</span>
            <button aria-label="Augmenter la quantité" className="p-4 hover:bg-accent disabled:opacity-30" disabled={qty >= Math.min(available || MAX_QTY_PER_LINE, MAX_QTY_PER_LINE)} onClick={() => setQty((q) => q + 1)}><Plus className="size-4" /></button>
          </div>
          <button onClick={add} disabled={!storeOpen || colorSold} className="label-mono flex-1 bg-foreground py-4 text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
            {!storeOpen ? "Boutique fermée" : colorSold ? "Épuisé" : size ? "Ajouter au panier" : "Choisissez une taille"}
          </button>
        </div>

        <ul className="mt-8 space-y-3 border-t border-border pt-6 text-sm text-muted-foreground">
          <li className="flex items-center gap-3"><Truck className="size-4 shrink-0 text-foreground" />Cash on delivery across Tunisia{freeOver > 0 ? ` · free delivery over ${formatPrice(freeOver, currency)}` : ""}</li>
          <li className="flex items-center gap-3"><Check className="size-4 shrink-0 text-foreground" />Payez à la réception, rien n'est débité maintenant</li>
        </ul>

        <Accordion type="single" collapsible defaultValue="details" className="mt-6 border-t border-border">
          <AccordionItem value="details" className="border-border">
            <AccordionTrigger className="label-mono py-5 hover:no-underline">Détails</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {(product.details.length ? product.details : ["Broderie artisanale", "Sur mesure possible"]).map((d, i) => <li key={i}>— {d}</li>)}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="delivery" className="border-border">
            <AccordionTrigger className="label-mono py-5 hover:no-underline">Livraison &amp; retouches</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
              We deliver across Tunisia and you pay in cash when the parcel arrives. See the <Link href="/shipping-returns" className="underline">page livraison &amp; retouches</Link> for the details.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
