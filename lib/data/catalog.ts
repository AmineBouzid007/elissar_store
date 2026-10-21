import "server-only"
import { isDbConfigured, query } from "@/lib/db"
import { COLORS, SIZES, type Color, type Size } from "@/lib/constants"
import { COLLECTION, SEED_CATEGORIES, SEED_PRODUCTS, STATIC_DETAILS } from "@/lib/db/seed"
import type { Category, Product, Variant } from "@/lib/types"

const PRODUCT_SELECT = `
  select p.*, c.slug as category_slug, c.name as category_name,
    coalesce(json_agg(json_build_object('id', v.id, 'size', v.size, 'color', v.color, 'stock', v.stock))
      filter (where v.id is not null), '[]') as variants
  from products p
  left join categories c on c.id = p.category_id
  left join variants v on v.product_id = p.id`

function mapProduct(r: any): Product {
  const variants: Variant[] = (r.variants ?? [])
    .map((v: any) => ({ id: v.id, size: v.size, color: v.color, stock: Number(v.stock) }))
    .sort((a: Variant, b: Variant) => SIZES.indexOf(a.size) - SIZES.indexOf(b.size))
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    price: Number(r.price),
    compare_at_price: r.compare_at_price == null ? null : Number(r.compare_at_price),
    category_id: r.category_id,
    category_slug: r.category_slug,
    category_name: r.category_name,
    collection: r.collection ?? "",
    images: r.images ?? [],
    images_by_color: r.images_by_color ?? {},
    details: r.details ?? [],
    is_active: r.is_active,
    is_featured: r.is_featured,
    is_new: r.is_new,
    created_at: new Date(r.created_at).toISOString(),
    variants,
  }
}

// ---- static fallback (no database connected yet) ----
function staticProducts(): Product[] {
  return SEED_PRODUCTS.map((p, i) => {
    const cat = SEED_CATEGORIES.find((c) => c.slug === p.category)!
    const variants: Variant[] = p.colors.flatMap((color) =>
      SIZES.map((size: Size) => ({ id: `seed-${p.slug}-${color}-${size}`, size, color, stock: 5 })),
    )
    return {
      id: `seed-${p.slug}`,
      slug: p.slug,
      name: p.name,
      description: p.description,
      price: p.price,
      compare_at_price: null,
      category_id: `seed-cat-${cat.slug}`,
      category_slug: cat.slug,
      category_name: cat.name,
      collection: COLLECTION,
      images: p.images,
      images_by_color: {},
      details: STATIC_DETAILS,
      is_active: true,
      is_featured: p.is_featured,
      is_new: p.is_new,
      created_at: new Date(2026, 9, 1 + (SEED_PRODUCTS.length - i)).toISOString(),
      variants,
    }
  })
}

function staticCategories(): Category[] {
  return SEED_CATEGORIES.map((c) => ({
    id: `seed-cat-${c.slug}`,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image_url: "",
    sort_order: c.sort_order,
    product_count: SEED_PRODUCTS.filter((p) => p.category === c.slug).length,
  }))
}

export async function getProducts(opts: { includeInactive?: boolean } = {}): Promise<Product[]> {
  if (!isDbConfigured()) return staticProducts()
  try {
    const rows = await query(
      `${PRODUCT_SELECT} ${opts.includeInactive ? "" : "where p.is_active"}
       group by p.id, c.id order by p.created_at desc`,
    )
    return rows.map(mapProduct)
  } catch (e) {
    console.error("[catalog] getProducts failed:", (e as Error).message)
    return staticProducts()
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isDbConfigured()) return staticProducts().find((p) => p.slug === slug) ?? null
  const rows = await query(`${PRODUCT_SELECT} where p.slug = $1 and p.is_active group by p.id, c.id`, [slug])
  return rows[0] ? mapProduct(rows[0]) : null
}

export async function getProductById(id: string): Promise<Product | null> {
  const rows = await query(`${PRODUCT_SELECT} where p.id = $1 group by p.id, c.id`, [id])
  return rows[0] ? mapProduct(rows[0]) : null
}

export async function getCategories(opts: { onlyWithProducts?: boolean } = {}): Promise<Category[]> {
  let cats: Category[]
  if (!isDbConfigured()) cats = staticCategories()
  else {
    try {
      const rows = await query(
        `select c.*, count(p.id) filter (where p.is_active) as product_count
         from categories c left join products p on p.category_id = c.id
         group by c.id order by c.sort_order, c.name`,
      )
      cats = rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        image_url: r.image_url,
        sort_order: r.sort_order,
        product_count: Number(r.product_count),
      }))
    } catch (e) {
      console.error("[catalog] getCategories failed:", (e as Error).message)
      cats = staticCategories()
    }
  }
  return opts.onlyWithProducts ? cats.filter((c) => (c.product_count ?? 0) > 0) : cats
}

// ---- helpers shared by pages ----
export function productImages(p: Product, color?: Color): string[] {
  const byColor = color ? p.images_by_color?.[color] : undefined
  if (byColor && byColor.length) return byColor
  return p.images
}

export function productCover(p: Product, color?: Color): string {
  return productImages(p, color)[0] ?? ""
}

export function totalStock(p: Product) {
  return p.variants.reduce((s, v) => s + v.stock, 0)
}

export function colorsInStock(p: Product): Color[] {
  const set = new Set<Color>()
  p.variants.forEach((v) => v.stock > 0 && set.add(v.color))
  return (COLORS as readonly Color[]).filter((c) => set.has(c))
}
