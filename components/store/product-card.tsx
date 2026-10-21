import Link from "next/link"
import { colorsInStock, productCover, productImages, totalStock } from "@/lib/data/catalog"
import { COLOR_HEX, COLOR_LABEL } from "@/lib/constants"
import { formatPrice } from "@/lib/format"
import type { Product } from "@/lib/types"
import { ProductImage } from "./product-image"

export function ProductCard({ product, currency = "TND", priority }: { product: Product; currency?: string; priority?: boolean }) {
  const sold = totalStock(product) === 0
  const colors = colorsInStock(product)
  const imgs = productImages(product)
  const hover = imgs[1]
  const onSale = product.compare_at_price && product.compare_at_price > product.price
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden border border-border">
        <ProductImage
          src={productCover(product)}
          alt={product.name}
          label={product.name}
          priority={priority}
          className="size-full"
          imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        {hover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hover} alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {sold ? (
            <span className="label-mono bg-background px-2 py-1 text-foreground">Épuisé</span>
          ) : (
            <>
              {product.is_new && <span className="label-mono bg-foreground px-2 py-1 text-background">Nouveau</span>}
              {onSale && <span className="label-mono border border-foreground bg-background px-2 py-1">Promo</span>}
            </>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h3 className="font-display text-base leading-tight sm:truncate sm:text-lg">{product.name}</h3>
          <div className="mt-2 flex items-center gap-1.5" aria-label={`Couleurs : ${colors.map((c) => COLOR_LABEL[c]).join(", ")}`}>
            {colors.map((c) => (
              <span key={c} className="size-3 rounded-full border border-foreground/40" style={{ background: COLOR_HEX[c] }} />
            ))}
            <span className="label-mono ml-1 text-muted-foreground">XS—XL</span>
          </div>
        </div>
        <div className="shrink-0 font-mono text-sm sm:text-right">
          {formatPrice(product.price, currency)}
          {onSale && <div className="text-xs text-muted-foreground line-through">{formatPrice(product.compare_at_price!, currency)}</div>}
        </div>
      </div>
    </Link>
  )
}
