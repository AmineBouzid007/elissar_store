import "server-only"
import { paymentProvider } from "./config"
import { clictopayGateway } from "./gateways/clictopay"
import { mockGateway } from "./gateways/mock"
import { PaymentError, type PaymentGateway } from "./types"

export function getGateway(): PaymentGateway {
  const p = paymentProvider()
  if (p === "mock") return mockGateway
  if (p === "clictopay") return clictopayGateway
  throw new PaymentError("Le paiement par carte n'est pas activé.")
}

/** The gateway that opened an existing payment session (it may differ from the current PAYMENT_PROVIDER). */
export function gatewayById(id: string): PaymentGateway {
  if (id === "mock") return mockGateway
  if (id === "clictopay") return clictopayGateway
  throw new PaymentError(`Passerelle inconnue : ${id}`)
}

export { isCardPaymentEnabled } from "./config"
export { PaymentError } from "./types"
