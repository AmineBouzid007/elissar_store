import { CartProvider } from "@/lib/cart-context"
import { getSettings } from "@/lib/data/settings"
import { getCategories } from "@/lib/data/catalog"
import { AnnouncementBar } from "@/components/store/announcement-bar"
import { Navigation } from "@/components/store/navigation"
import { Footer } from "@/components/store/footer"
import { CartDrawer } from "@/components/store/cart-drawer"

export const dynamic = "force-dynamic"

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories({ onlyWithProducts: true })])
  return (
    <CartProvider shipping={{ fee: settings.shipping_fee, freeOver: settings.free_shipping_threshold, currency: settings.currency }}>
      <AnnouncementBar text={settings.announcement} />
      <Navigation categories={categories.map((c) => ({ name: c.name, slug: c.slug }))} />
      <main className="min-h-[70vh]">{children}</main>
      <Footer settings={settings} categories={categories.map((c) => ({ name: c.name, slug: c.slug }))} />
      <CartDrawer />
    </CartProvider>
  )
}
