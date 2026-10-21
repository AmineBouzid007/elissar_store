import Link from "next/link"
import type { Metadata } from "next"
import { ProductCard } from "@/components/store/product-card"
import { getCategories, getProducts } from "@/lib/data/catalog"
import { getSettings } from "@/lib/data/settings"
import { COLORS, COLOR_LABEL, SIZES } from "@/lib/constants"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Boutique" }

type SP = { category?: string; color?: string; size?: string; sort?: string }

const SORTS = [
  { key: "new", label: "Nouveautés" },
  { key: "low", label: "Prix croissant" },
  { key: "high", label: "Prix décroissant" },
]

export default async function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  const [all, categories, settings] = await Promise.all([getProducts(), getCategories({ onlyWithProducts: true }), getSettings()])

  const color = COLORS.find((c) => c === sp.color)
  const size = SIZES.find((s) => s === sp.size)
  const sort = SORTS.some((s) => s.key === sp.sort) ? sp.sort! : "new"
  const category = categories.find((c) => c.slug === sp.category)

  let list = all.filter((p) => !category || p.category_slug === category.slug)
  if (color || size) {
    list = list.filter((p) => p.variants.some((v) => v.stock > 0 && (!color || v.color === color) && (!size || v.size === size)))
  }
  if (sort === "low") list = [...list].sort((a, b) => a.price - b.price)
  if (sort === "high") list = [...list].sort((a, b) => b.price - a.price)

  const href = (patch: Partial<SP>) => {
    const next = { category: sp.category, color: sp.color, size: sp.size, sort: sp.sort, ...patch }
    const q = new URLSearchParams()
    Object.entries(next).forEach(([k, v]) => v && q.set(k, v))
    const s = q.toString()
    return s ? `/shop?${s}` : "/shop"
  }
  const chip = (active: boolean) =>
    cn("label-mono border px-4 py-2.5 transition-colors", active ? "border-foreground bg-foreground text-background" : "border-border text-foreground/70 hover:border-foreground/60 hover:text-foreground")
  const filtered = Boolean(category || color || size)

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12 lg:px-10 lg:py-16">
      <p className="label-mono mb-3 text-muted-foreground">{category ? "Catégorie" : "Prêt-à-porter & haute couture"}</p>
      <h1 className="font-display text-5xl sm:text-7xl">{category?.name ?? "La boutique"}</h1>
      {category?.description && category.description !== "Bientôt disponible." && <p className="mt-4 max-w-lg text-muted-foreground">{category.description}</p>}

      <div className="mt-10 space-y-5 border-y border-border py-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="label-mono mr-2 w-16 text-muted-foreground">Catégorie</span>
          <Link href={href({ category: undefined })} className={chip(!category)}>Toutes</Link>
          {categories.map((c) => <Link key={c.slug} href={href({ category: c.slug })} className={chip(category?.slug === c.slug)}>{c.name}</Link>)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="label-mono mr-2 w-16 text-muted-foreground">Couleur</span>
          <Link href={href({ color: undefined })} className={chip(!color)}>Toutes</Link>
          {COLORS.map((c) => <Link key={c} href={href({ color: c })} className={chip(color === c)}>{COLOR_LABEL[c]}</Link>)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="label-mono mr-2 w-16 text-muted-foreground">Taille</span>
          <Link href={href({ size: undefined })} className={chip(!size)}>Toutes</Link>
          {SIZES.map((s) => <Link key={s} href={href({ size: s })} className={chip(size === s)}>{s}</Link>)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="label-mono mr-2 w-16 text-muted-foreground">Trier</span>
          {SORTS.map((s) => <Link key={s.key} href={href({ sort: s.key === "new" ? undefined : s.key })} className={chip(sort === s.key)}>{s.label}</Link>)}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="label-mono text-muted-foreground">{list.length} {list.length === 1 ? "piece" : "pieces"}</span>
        {filtered && <Link href="/shop" className="label-mono underline underline-offset-4">Effacer les filtres</Link>}
      </div>

      {list.length === 0 ? (
        <div className="py-32 text-center">
          <p className="font-display text-4xl">Aucune pièce trouvée</p>
          <p className="mt-3 text-muted-foreground">Essayez de retirer un filtre.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-6">
          {list.map((p, i) => <ProductCard key={p.id} product={p} currency={settings.currency} priority={i < 4} />)}
        </div>
      )}
    </div>
  )
}
