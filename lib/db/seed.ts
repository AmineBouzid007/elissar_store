import type { PoolClient } from "pg"
import { SIZES } from "@/lib/constants"
import type { Color } from "@/lib/constants"

// Starter catalogue taken from elissar.tn (names + photos). The original site shows
// "Pré-commander" without prices, so prices and stock below are PLACEHOLDERS:
// edit them in /admin -> Produits before going live.
const UP = "https://www.elissar.tn/wp-content/uploads/"

export interface SeedProduct {
  slug: string
  name: string
  description: string
  price: number
  category: string
  is_featured: boolean
  is_new: boolean
  images: string[]
  colors: Color[]
}

export const SEED_CATEGORIES = [
  { name: "Prêt-à-porter", slug: "pret-a-porter", description: "Capes, blousons, tuniques, robes et châles : audacieuse au travail ou détendue chez soi.", sort_order: 1 },
  { name: "Haute Couture", slug: "haute-couture", description: "Des étoffes nobles, une finition unique, sur mesure.", sort_order: 2 },
  { name: "Évènements", slug: "evenements", description: "Mariages, fiançailles, henné : jebbas, caftans et sefsaris.", sort_order: 3 },
]

export const COLLECTION = "Collection Automne-Hiver"

const DETAILS = ["Broderie artisanale", "Tissus nobles", "Fabrication tunisienne", "Sur mesure possible", "Retouche gratuite sous 30 jours"]

export const SEED_PRODUCTS: SeedProduct[] = [
  { slug: "collection-capes", name: "Collection Capes", description: "Capes brodées aux couleurs franches : un manteau sport-chic facile à porter, qui traverse les saisons.", price: 390, category: "pret-a-porter", is_featured: true, is_new: true, images: [UP + "2023/02/cap-6-300x400.jpg", UP + "2023/02/cap-5-1-300x400.jpg"], colors: ["indigo", "fuchsia"] },
  { slug: "collection-blousons", name: "Collection Blousons", description: "Des blousons où la broderie traditionnelle rencontre une coupe contemporaine.", price: 320, category: "pret-a-porter", is_featured: true, is_new: true, images: [UP + "2025/07/Site-40.jpg", UP + "2025/07/Site-1.jpg"], colors: ["indigo", "safran"] },
  { slug: "collection-chales", name: "Collection Châles", description: "Des châles légers et colorés pour sublimer chaque tenue, été comme hiver.", price: 120, category: "pret-a-porter", is_featured: false, is_new: false, images: [UP + "2020/12/chale.jpg", UP + "2020/12/chale1.jpg"], colors: ["fuchsia", "emeraude"] },
  { slug: "collection-robes-pret-a-porter", name: "Collection Robes Prêt-à-porter", description: "Ni trop chargées, ni trop simples : des robes différentes de ce qu'on voit partout.", price: 450, category: "pret-a-porter", is_featured: true, is_new: true, images: [UP + "2024/09/2Q1A1214-copie.jpg", UP + "2024/09/1S7A4101-copie.jpg"], colors: ["indigo", "ivoire"] },
  { slug: "collection-tuniques", name: "Collection Tuniques", description: "Tuniques élégantes pour les réunions, les conférences et les voyages.", price: 280, category: "pret-a-porter", is_featured: false, is_new: false, images: [UP + "2024/09/1S7A8329-copie.jpg", UP + "2024/09/DSC8665-copie.jpg"], colors: ["emeraude", "safran"] },
  { slug: "collection-farmlas", name: "Collection Farmlas", description: "La farmla revisitée, brodée avec soin.", price: 260, category: "pret-a-porter", is_featured: false, is_new: false, images: [UP + "2020/12/gilet-300x400.jpg", UP + "2020/12/gilet5-300x200.jpg"], colors: ["indigo", "fuchsia"] },
  { slug: "jebbas-hammametoises-kahena", name: "Jebbas Hammametoises : Kahena", description: "La jebba hammametoise, ajustée à vos mensurations. Finition haute couture.", price: 690, category: "haute-couture", is_featured: true, is_new: false, images: [UP + "2020/12/1-300x400.jpg", UP + "2020/12/2-300x400.jpg"], colors: ["indigo", "fuchsia", "safran"] },
  { slug: "gilet-founa", name: "Gilet Founa", description: "Pièce signature de la maison, faite pour durer au-delà des saisons.", price: 340, category: "haute-couture", is_featured: false, is_new: false, images: [UP + "2020/12/giletfouna3-300x400.jpg", UP + "2020/12/giletfouna4-300x400.jpg"], colors: ["safran", "ivoire"] },
] 

export const DEFAULT_SETTINGS: Record<string, unknown> = {
  shipping_fee: 0,
  free_shipping_threshold: 0,
  currency: "TND",
  announcement: "Livraison gratuite en Tunisie · Paiement à la livraison · Retouche gratuite sous 30 jours",
  contact_email: "contact@elissar.tn",
  contact_phone: "+216 27 42 43 09",
  whatsapp: "21627424309",
  instagram: "https://www.instagram.com/elissar.maisondecouture/",
  tiktok: "",
  hero_image: UP + "2021/01/koftan-1170x600.jpg",
  size_chart: "",
  store_open: true,
}

export async function seedDatabase(client: PoolClient) {
  const seeded = await client.query(`select 1 from settings where key = 'seeded'`)
  if (seeded.rowCount) return

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await client.query(
      `insert into settings (key, value) values ($1, $2::jsonb) on conflict (key) do nothing`,
      [key, JSON.stringify(value)],
    )
  }

  const catIds: Record<string, string> = {}
  for (const c of SEED_CATEGORIES) {
    const r = await client.query(
      `insert into categories (name, slug, description, sort_order) values ($1,$2,$3,$4)
       on conflict (slug) do update set name = excluded.name returning id`,
      [c.name, c.slug, c.description, c.sort_order],
    )
    catIds[c.slug] = r.rows[0].id
  }

  for (const p of SEED_PRODUCTS) {
    const r = await client.query(
      `insert into products (slug, name, description, price, category_id, collection, details, images, is_featured, is_new)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) on conflict (slug) do nothing returning id`,
      [p.slug, p.name, p.description, p.price, catIds[p.category], COLLECTION, DETAILS, p.images, p.is_featured, p.is_new],
    )
    const id = r.rows[0]?.id
    if (!id) continue
    for (const color of p.colors) {
      for (const size of SIZES) {
        await client.query(
          `insert into variants (product_id, size, color, stock) values ($1,$2,$3,$4) on conflict do nothing`,
          [id, size, color, 5],
        )
      }
    }
  }

  await client.query(`insert into settings (key, value) values ('seeded', 'true'::jsonb) on conflict do nothing`)
}

/** Used when no database is connected, so the storefront still renders. */
export const STATIC_DETAILS = DETAILS
