import "server-only"
import { PaymentError, type CreatePaymentInput, type PaymentGateway, type PaymentStatusResult } from "../types"

/**
 * ClicToPay (SMT / Monétique Tunisie) adapter.
 *
 * !! NOT VERIFIED AGAINST THE BANK'S DOCUMENTATION !!
 * Written from the usual shape of the ClicToPay REST integration (a "register" call that returns a hosted
 * payment URL, and an "order status" call used to confirm the result). The bank documents the exact
 * endpoints, field names and status codes when it issues the test credentials — check every `TODO(bank)`
 * below against that document before enabling PAYMENT_PROVIDER=clictopay, then test with the test account.
 *
 * Environment:
 *   CLICTOPAY_USERNAME / CLICTOPAY_PASSWORD   credentials from the bank (test, then live)
 *   CLICTOPAY_BASE_URL                         e.g. the test base URL, then the live one (no default on purpose)
 */

const CURRENCY_TND = "788" // ISO 4217 numeric code for TND

function config() {
  const username = process.env.CLICTOPAY_USERNAME
  const password = process.env.CLICTOPAY_PASSWORD
  const baseUrl = process.env.CLICTOPAY_BASE_URL?.replace(/\/+$/, "")
  if (!username || !password || !baseUrl) {
    throw new PaymentError("ClicToPay n'est pas configuré (CLICTOPAY_USERNAME, CLICTOPAY_PASSWORD, CLICTOPAY_BASE_URL).")
  }
  return { username, password, baseUrl }
}

async function call(path: string, params: Record<string, string>) {
  const { username, password, baseUrl } = config()
  const res = await fetch(`${baseUrl}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ userName: username, password, ...params }),
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new PaymentError(`ClicToPay a répondu ${res.status}.`)
  return (await res.json()) as Record<string, unknown>
}

export const clictopayGateway: PaymentGateway = {
  id: "clictopay",

  async createPayment(input: CreatePaymentInput) {
    // TODO(bank): confirm endpoint name, parameter names and that `orderNumber` must be unique per attempt.
    // A retry for the same shop order needs a new gateway order number, hence the suffix.
    const attemptNumber = `${input.orderNumber}-${Date.now().toString(36)}`
    const data = await call("register.do", {
      orderNumber: attemptNumber,
      amount: String(input.amountMillimes), // millimes, integer
      currency: CURRENCY_TND,
      returnUrl: input.returnUrl,
      failUrl: input.failUrl,
      description: input.description.slice(0, 99),
      language: "fr",
    })
    const orderId = typeof data.orderId === "string" ? data.orderId : ""
    const formUrl = typeof data.formUrl === "string" ? data.formUrl : ""
    if (!orderId || !formUrl) {
      // TODO(bank): confirm the error fields (usually an error code + message).
      throw new PaymentError("ClicToPay n'a pas ouvert de session de paiement.")
    }
    return { gatewayOrderId: orderId, redirectUrl: formUrl, raw: { orderNumber: attemptNumber } }
  },

  async getStatus(gatewayOrderId: string): Promise<PaymentStatusResult> {
    // TODO(bank): confirm endpoint and the meaning of each status code (which one means "paid",
    // which ones are final failures, which ones are still in progress).
    const data = await call("getOrderStatus.do", { orderId: gatewayOrderId, language: "fr" })
    const code = Number(data.OrderStatus)
    const amount = Number(data.Amount ?? data.amount)
    const raw = { OrderStatus: data.OrderStatus, ErrorCode: data.ErrorCode, ErrorMessage: data.ErrorMessage }
    if (code === 2) return { status: "paid", amountMillimes: Number.isFinite(amount) ? amount : undefined, raw }
    if ([3, 4, 6].includes(code)) return { status: "failed", raw }
    return { status: "pending", raw }
  },
}
