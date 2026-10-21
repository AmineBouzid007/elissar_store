import { NextResponse, type NextRequest } from "next/server"
import { isDbConfigured } from "@/lib/db"
import { getOrderForConfirmation } from "@/lib/data/orders"
import { abandonCardOrder, settleOrder } from "@/lib/payments/service"

export const dynamic = "force-dynamic"

/**
 * Where the payment page sends the customer back to (success or failure).
 * The URL only says WHO is coming back; what happened is always asked to the gateway.
 */
export async function GET(req: NextRequest) {
  const go = (pathname: string, search = "") => {
    const url = req.nextUrl.clone()
    url.pathname = pathname
    url.search = search
    return NextResponse.redirect(url, 303)
  }

  const number = req.nextUrl.searchParams.get("order") ?? ""
  const token = req.nextUrl.searchParams.get("k") ?? ""
  if (!isDbConfigured() || !number || !token) return go("/checkout")

  try {
    // the secret token proves this is the customer who placed the order
    const order = await getOrderForConfirmation(number, token)
    if (!order || order.payment_method !== "card") return go("/checkout")

    const cameBackFromFailUrl = req.nextUrl.searchParams.get("result") === "fail"
    const result = cameBackFromFailUrl ? await abandonCardOrder(number) : await settleOrder(number)
    if (result === "failed") return go("/checkout", "?payment=failed")
  } catch (e) {
    console.error("[payments] return route failed", number, e)
    // fall through: the confirmation page re-checks the payment and says "being verified" if it can't tell
  }
  return go(`/checkout/confirmation/${encodeURIComponent(number)}`, `?k=${encodeURIComponent(token)}`)
}
