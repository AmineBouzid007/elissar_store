import type { Metadata } from "next"
import { CheckoutForm } from "@/components/store/checkout-form"
import { isDbConfigured } from "@/lib/db"
import { getSettings } from "@/lib/data/settings"

export const metadata: Metadata = { title: "Checkout" }

export default async function CheckoutPage() {
  const settings = await getSettings()
  return <CheckoutForm dbReady={isDbConfigured()} storeOpen={settings.store_open} />
}
