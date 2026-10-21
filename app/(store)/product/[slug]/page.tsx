import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ProductCard } from "@/components/store/product-card"
import { ProductView } from "@/components/store/product-view"
import { getProductBySlug, getProducts } from "@/lib/data/catalog"
import { getSettings } from "@/lib/data/settings"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = await getProductBySlug(slug)
  if (!p) return {}
  return { title: p.name, description: p.description || undefined, openGraph: p.images[0] ? { images: [p.images[0]] } : undefined }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [product, settings, all] = await Promise.all([getProductBySlug(slug), getSettings(), getProducts()])
  if (!product) notFound()
  const related = all.filter((p) => p.id !== product.id).sort((a) => (a.category_id === product.category_id ? -1 : 1)).slice(0, 4)

  return (
    <>
      <div className="mx-auto max-w-[1400px] px-5 pt-6 lg:px-10">
        <nav className="label-mono flex items-center gap-2 text-muted-foreground" aria-label="Fil d'Ariane">
          <Link href="/shop" className="hover:text-foreground">Boutique</Link>
          {product.category_slug && (<><span>/</span><Link href={`/shop?category=${product.category_slug}`} className="hover:text-foreground">{product.category_name}</Link></>)}
          <span>/</span><span className="text-foreground">{product.name}</span>
        </nav>
      </div>
      <ProductView product={product} currency={settings.currency} freeOver={settings.free_shipping_threshold} storeOpen={settings.store_open} />
      {related.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 py-20 lg:px-10">
          <h2 className="font-display mb-10 text-3xl sm:text-5xl">Vous aimerez aussi</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
            {related.map((p) => <ProductCard key={p.id} product={p} currency={settings.currency} />)}
          </div>
        </section>
      )}
    </>
  )
}
