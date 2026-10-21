import "server-only"

export type PaymentProvider = "none" | "mock" | "clictopay"

/** PAYMENT_PROVIDER = none (default) | mock | clictopay */
export function paymentProvider(): PaymentProvider {
  const v = (process.env.PAYMENT_PROVIDER ?? "none").trim().toLowerCase()
  if (v === "mock" || v === "clictopay") return v
  return "none"
}

/**
 * The mock gateway has a "pay successfully" button, so it must never be live by accident:
 * it is refused on a Vercel production deployment unless ALLOW_MOCK_PAYMENTS=true is set on purpose
 * (e.g. to demo the prototype to the client).
 */
export function mockAllowed() {
  if (process.env.ALLOW_MOCK_PAYMENTS === "true") return true
  return process.env.VERCEL_ENV !== "production"
}

export function isCardPaymentEnabled() {
  const p = paymentProvider()
  if (p === "mock") return mockAllowed()
  if (p === "clictopay") return Boolean(process.env.CLICTOPAY_USERNAME && process.env.CLICTOPAY_PASSWORD && process.env.CLICTOPAY_BASE_URL)
  return false
}

/** Minutes an unpaid card order keeps its stock reserved before it is cancelled automatically. */
export function cardOrderExpiryMinutes() {
  const n = Number(process.env.CARD_ORDER_EXPIRY_MINUTES)
  return Number.isFinite(n) && n >= 5 ? n : 45
}

export function toMillimes(tnd: number) {
  return Math.round(tnd * 1000)
}
