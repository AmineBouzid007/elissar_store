import type { MetadataRoute } from "next"
import { getProducts } from "@/lib/data/catalog"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const products = await getProducts()
  return [
    ...["", "/shop", "/about", "/contact", "/size-guide", "/shipping-returns", "/track"].map((p) => ({ url: `${base}${p}` })),
    ...products.map((p) => ({ url: `${base}/product/${p.slug}` })),
  ]
}
