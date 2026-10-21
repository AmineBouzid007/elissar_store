import "server-only"
import { randomBytes } from "node:crypto"
import { query } from "@/lib/db"
import { PaymentError, type CreatePaymentInput, type PaymentGateway } from "../types"
import { mockAllowed } from "../config"

/**
 * Fake gateway for development and demos. The "gateway side" state (what the customer clicked on the
 * fake payment page) is kept in payment_attempts.raw.mock_outcome, set by /pay/mock/[number].
 */
export const mockGateway: PaymentGateway = {
  id: "mock",

  async createPayment(input: CreatePaymentInput) {
    if (!mockAllowed()) throw new PaymentError("Le paiement de test est désactivé en production.")
    const gatewayOrderId = `mock_${randomBytes(8).toString("hex")}`
    // The fake page lives on our own site; the real gateway would give us its own hosted URL.
    const ret = new URL(input.returnUrl)
    const token = ret.searchParams.get("k") ?? ""
    const redirectUrl = `${ret.origin}/pay/mock/${encodeURIComponent(input.orderNumber)}?k=${encodeURIComponent(token)}&g=${gatewayOrderId}`
    return { gatewayOrderId, redirectUrl }
  },

  async getStatus(gatewayOrderId: string) {
    const rows = await query<{ raw: { mock_outcome?: string }; amount_millimes: string }>(
      `select raw, amount_millimes from payment_attempts where gateway = 'mock' and gateway_order_id = $1`,
      [gatewayOrderId],
    )
    const outcome = rows[0]?.raw?.mock_outcome
    if (outcome === "paid") return { status: "paid" as const, amountMillimes: Number(rows[0].amount_millimes) }
    if (outcome === "failed") return { status: "failed" as const }
    return { status: "pending" as const }
  },
}
