import type { Metadata } from "next"
import { CheckoutForm } from "@/components/store/checkout-form"
import { isDbConfigured } from "@/lib/db"
import { getSettings } from "@/lib/data/settings"
import { isCardPaymentEnabled } from "@/lib/payments"

export const metadata: Metadata = { title: "Checkout" }
export const dynamic = "force-dynamic"

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ payment?: string }> }) {
  const [settings, { payment }] = await Promise.all([getSettings(), searchParams])
  return (
    <CheckoutForm
      dbReady={isDbConfigured()}
      storeOpen={settings.store_open}
      cardEnabled={isCardPaymentEnabled()}
      paymentFailed={payment === "failed"}
    />
  )
}
