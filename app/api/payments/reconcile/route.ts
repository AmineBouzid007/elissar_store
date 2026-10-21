import { NextResponse, type NextRequest } from "next/server"
import { isDbConfigured } from "@/lib/db"
import { reconcileStaleCardOrders } from "@/lib/payments/service"

export const dynamic = "force-dynamic"

/**
 * Re-checks card orders left hanging and cancels the expired ones (their stock goes back on sale).
 * Protected by CRON_SECRET: call it with `Authorization: Bearer <CRON_SECRET>` (Vercel Cron sends this itself).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!isDbConfigured()) return NextResponse.json({ error: "No database" }, { status: 503 })
  return NextResponse.json(await reconcileStaleCardOrders())
}
