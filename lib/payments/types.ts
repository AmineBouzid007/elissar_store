export type GatewayStatus = "paid" | "pending" | "failed"

export interface CreatePaymentInput {
  /** our order number, e.g. EL-1001 */
  orderNumber: string
  /** amount in millimes (1 TND = 1000 millimes), always an integer */
  amountMillimes: number
  /** where the gateway sends the customer after a successful or failed attempt */
  returnUrl: string
  failUrl: string
  description: string
}

export interface CreatePaymentResult {
  /** the gateway's own id for this payment session */
  gatewayOrderId: string
  /** hosted payment page the customer is redirected to */
  redirectUrl: string
  /** anything worth keeping for audit (never card data) */
  raw?: Record<string, unknown>
}

export interface PaymentStatusResult {
  status: GatewayStatus
  /** amount the gateway says was paid, when it reports one */
  amountMillimes?: number
  raw?: Record<string, unknown>
}

/**
 * A payment gateway = "create a hosted payment session" + "ask what happened to it".
 * The shop never trusts the browser's return URL: it always calls getStatus().
 */
export interface PaymentGateway {
  id: "mock" | "clictopay"
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>
  getStatus(gatewayOrderId: string): Promise<PaymentStatusResult>
}

export class PaymentError extends Error {}
