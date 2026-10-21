import "server-only"
import { z } from "zod"
import { query, withTx } from "@/lib/db"
import { COLORS, SIZES } from "@/lib/constants"
import { slugify } from "@/lib/format"

export class AdminError extends Error {}

export const productSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  slug: z.string().trim().max(80).optional().default(""),
  description: z.string().trim().max(2000).default(""),
  price: z.coerce.number().min(0, "Price must be 0 or more").max(100000),
  compare_at_price: z.preprocess((v) => (v === "" || v == null ? null : v), z.coerce.number().min(0).nullable()),
  category_id: z.preprocess((v) => (v === "" || v == null || v === "none" ? null : v), z.string().uuid().nullable()),
  collection: z.string().trim().max(120).default(""),
  details: z.array(z.string().trim().min(1).max(200)).max(20).default([]),
  images: z.array(z.string().trim().min(1).max(600)).max(12).default([]),
  images_by_color: z.record(z.string(), z.array(z.string().trim().min(1).max(600)).max(12)).default({}),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_new: z.boolean().default(false),
  stock: z.record(z.string(), z.number().int().min(0).max(100000)),
})
export type ProductInput = z.infer<typeof productSchema>

export async function saveProduct(input: ProductInput, id?: string): Promise<string> {
  const slug = slugify(input.slug || input.name)
  if (!slug) throw new AdminError("Could not build a URL from that name.")
  const imagesByColor: Record<string, string[]> = {}
  for (const [c, list] of Object.entries(input.images_by_color)) if (list.length) imagesByColor[c] = list

  return withTx(async (db) => {
    const clash = await db.query(`select id from products where slug = $1 and ($2::uuid is null or id <> $2)`, [slug, id ?? null])
    if (clash.rowCount) throw new AdminError(`Another product already uses the URL "${slug}".`)

    const vals = [
      slug, input.name, input.description, input.price, input.compare_at_price, input.category_id, input.collection,
      input.images, JSON.stringify(imagesByColor), input.details, input.is_active, input.is_featured, input.is_new,
    ]
    let pid = id
    if (id) {
      const r = await db.query(
        `update products set slug=$1, name=$2, description=$3, price=$4, compare_at_price=$5, category_id=$6, collection=$7,
           images=$8, images_by_color=$9::jsonb, details=$10, is_active=$11, is_featured=$12, is_new=$13 where id = $14 returning id`,
        [...vals, id],
      )
      if (!r.rowCount) throw new AdminError("Product not found.")
    } else {
      const r = await db.query(
        `insert into products (slug, name, description, price, compare_at_price, category_id, collection, images, images_by_color, details, is_active, is_featured, is_new)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,$12,$13) returning id`,
        vals,
      )
      pid = r.rows[0].id
    }
    for (const color of COLORS) {
      for (const size of SIZES) {
        const stock = input.stock[`${color}_${size}`] ?? 0
        await db.query(
          `insert into variants (product_id, size, color, stock) values ($1,$2,$3,$4)
           on conflict (product_id, size, color) do update set stock = excluded.stock`,
          [pid, size, color, stock],
        )
      }
    }
    return pid!
  })
}

export async function deleteProduct(id: string) {
  await query(`delete from products where id = $1`, [id])
}

export async function setProductActive(id: string, active: boolean) {
  await query(`update products set is_active = $1 where id = $2`, [active, id])
}

// ---- categories ----
export async function saveCategory(input: { id?: string; name: string; description: string; image_url: string; sort_order: number }) {
  const name = input.name.trim()
  if (!name) throw new AdminError("Category name is required.")
  const slug = slugify(name)
  if (!slug) throw new AdminError("Could not build a URL from that name.")
  if (input.id) {
    const clash = await query(`select 1 from categories where slug = $1 and id <> $2`, [slug, input.id])
    if (clash.length) throw new AdminError("Another category already has that name.")
    await query(`update categories set name=$1, slug=$2, description=$3, image_url=$4, sort_order=$5 where id=$6`,
      [name, slug, input.description, input.image_url, input.sort_order, input.id])
  } else {
    const clash = await query(`select 1 from categories where slug = $1`, [slug])
    if (clash.length) throw new AdminError("A category with that name already exists.")
    await query(`insert into categories (name, slug, description, image_url, sort_order) values ($1,$2,$3,$4,$5)`,
      [name, slug, input.description, input.image_url, input.sort_order])
  }
}

export async function deleteCategory(id: string) {
  await query(`delete from categories where id = $1`, [id])
}
