"use server"

import { checkoutSchema, createOrder, OrderError } from "@/lib/data/orders"
import { isDbConfigured } from "@/lib/db"

export type CheckoutResult =
  | { ok: true; number: string; token: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

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
  try {
    const { number, token } = await createOrder(parsed.data)
    return { ok: true, number, token }
  } catch (e) {
    if (e instanceof OrderError) return { ok: false, error: e.message }
    console.error("[checkout] failed", e)
    return { ok: false, error: "Impossible d'enregistrer votre commande. Veuillez réessayer." }
  }
}
