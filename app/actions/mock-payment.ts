"use server"

import { redirect } from "next/navigation"
import { getOrderForConfirmation } from "@/lib/data/orders"
import { query } from "@/lib/db"
import { mockAllowed, paymentProvider } from "@/lib/payments/config"

/** The two buttons of the fake payment page. Only works when the mock gateway is enabled. */
export async function mockPayAction(number: string, token: string, outcome: "paid" | "failed") {
  if (paymentProvider() !== "mock" || !mockAllowed()) redirect("/checkout")
  const order = await getOrderForConfirmation(number, token)
  if (!order || order.payment_method !== "card" || order.payment_status !== "unpaid") redirect("/checkout")

  await query(
    `update payment_attempts set raw = raw || $2::jsonb, updated_at = now()
     where id = (select id from payment_attempts where order_id = $1 and gateway = 'mock' order by created_at desc limit 1)`,
    [order.id, JSON.stringify({ mock_outcome: outcome })],
  )
  const back = new URLSearchParams({ order: number, k: token })
  if (outcome === "failed") back.set("result", "fail")
  redirect(`/api/payments/return?${back}`)
}
