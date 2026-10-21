export const SIZES = ["XS", "S", "M", "L", "XL"] as const
export type Size = (typeof SIZES)[number]

export const COLORS = ["indigo", "fuchsia", "emeraude", "safran", "ivoire"] as const
export type Color = (typeof COLORS)[number]

export const COLOR_LABEL: Record<string, string> = { indigo: "Bleu indigo", fuchsia: "Fuchsia", emeraude: "Vert émeraude", safran: "Safran", ivoire: "Ivoire" }
export const COLOR_HEX: Record<string, string> = { indigo: "#1f4fa3", fuchsia: "#d6336c", emeraude: "#14866d", safran: "#f2a900", ivoire: "#efe7d6" }

export const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
}

export const PAYMENT_METHODS = ["cod", "card"] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cod: "Paiement à la livraison",
  card: "Carte bancaire",
}

export const PAYMENT_STATUSES = ["unpaid", "paid", "failed", "refunded"] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const GOVERNORATES = [
  "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Zaghouan", "Bizerte", "Béja",
  "Jendouba", "Le Kef", "Siliana", "Sousse", "Monastir", "Mahdia", "Sfax", "Kairouan",
  "Kasserine", "Sidi Bouzid", "Gabès", "Médenine", "Tataouine", "Gafsa", "Tozeur", "Kébili",
] as const

export const MAX_QTY_PER_LINE = 10
export const LOW_STOCK_THRESHOLD = 3
