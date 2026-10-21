"use server"

import { headers } from "next/headers"
import { checkoutSchema, createOrder, OrderError } from "@/lib/data/orders"
import { isDbConfigured } from "@/lib/db"
import { isCardPaymentEnabled, PaymentError } from "@/lib/payments"
import { failCardOrder, startCardPayment } from "@/lib/payments/service"

export type CheckoutResult =
  | { ok: true; number: string; token: string; /** card payments: hosted payment page to send the customer to */ redirectUrl?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

/** Public address of the site, used to tell the gateway where to send the customer back. */
async function siteOrigin() {
  const fixed = process.env.PAYMENT_RETURN_BASE_URL?.trim()
  if (fixed) return fixed.replace(/\/+$/, "")
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000"
  const local = /^(localhost|127\.0\.0\.1)(:|$)/.test(host)
  const proto = h.get("x-forwarded-proto")?.split(",")[0] ?? (local ? "http" : "https")
  return `${proto}://${host}`
}

export async function placeOrderAction(raw: unknown): Promise<CheckoutResult> {
  const obj = raw as Record<string, unknown> | null
  // honeypot — bots fill every field
  if (obj && typeof obj.website === "string" && obj.website.length > 0) return { ok: false, error: "Une erreur est survenue." }

  if (!isDbConfigured()) {
    return { ok: false, error: "Les commandes ne sont pas encore activées : la base de données n'est pas connectée." }
  }
  const parsed = checkoutSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] = i.message
    return { ok: false, error: Object.values(fieldErrors)[0] ?? "Vérifiez vos informations.", fieldErrors }
  }
  const wantsCard = parsed.data.payment_method === "card"
  if (wantsCard && !isCardPaymentEnabled()) {
    return { ok: false, error: "Le paiement par carte n'est pas disponible pour le moment. Choisissez le paiement à la livraison." }
  }

  let order
  try {
    order = await createOrder(parsed.data)
  } catch (e) {
    if (e instanceof OrderError) return { ok: false, error: e.message }
    console.error("[checkout] failed", e)
    return { ok: false, error: "Impossible d'enregistrer votre commande. Veuillez réessayer." }
  }
  if (!wantsCard) return { ok: true, number: order.number, token: order.token }

  try {
    const redirectUrl = await startCardPayment(order, await siteOrigin())
    return { ok: true, number: order.number, token: order.token, redirectUrl }
  } catch (e) {
    // no payment page was opened: release the stock and let the customer try again
    await failCardOrder(order.id).catch((err) => console.error("[checkout] could not release order", order.number, err))
    console.error("[checkout] card payment could not start", order.number, e)
    return {
      ok: false,
      error: e instanceof PaymentError ? e.message : "Le paiement par carte est indisponible. Réessayez ou choisissez le paiement à la livraison.",
    }
  }
}
