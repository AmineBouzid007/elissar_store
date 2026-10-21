import "server-only"
import { isDbConfigured, query } from "@/lib/db"
import { DEFAULT_SETTINGS } from "@/lib/db/seed"
import type { StoreSettings } from "@/lib/types"

export async function getSettings(): Promise<StoreSettings> {
  const base = { ...DEFAULT_SETTINGS } as Record<string, unknown>
  if (isDbConfigured()) {
    try {
      const rows = await query<{ key: string; value: unknown }>(`select key, value from settings`)
      for (const r of rows) base[r.key] = r.value
    } catch (e) {
      console.error("[settings] falling back to defaults:", (e as Error).message)
    }
  }
  return {
    shipping_fee: Number(base.shipping_fee) || 0,
    free_shipping_threshold: Number(base.free_shipping_threshold) || 0,
    currency: String(base.currency || "TND"),
    announcement: String(base.announcement ?? ""),
    contact_email: String(base.contact_email ?? ""),
    contact_phone: String(base.contact_phone ?? ""),
    whatsapp: String(base.whatsapp ?? ""),
    instagram: String(base.instagram ?? ""),
    tiktok: String(base.tiktok ?? ""),
    hero_image: String(base.hero_image ?? ""),
    size_chart: String(base.size_chart ?? ""),
    store_open: base.store_open !== false,
  }
}

export async function saveSettings(patch: Partial<StoreSettings>) {
  for (const [k, v] of Object.entries(patch)) {
    await query(
      `insert into settings (key, value) values ($1, $2::jsonb)
       on conflict (key) do update set value = excluded.value`,
      [k, JSON.stringify(v)],
    )
  }
}

export function computeShipping(subtotal: number, s: Pick<StoreSettings, "shipping_fee" | "free_shipping_threshold">) {
  if (subtotal <= 0) return 0
  if (s.free_shipping_threshold > 0 && subtotal >= s.free_shipping_threshold) return 0
  return s.shipping_fee
}
