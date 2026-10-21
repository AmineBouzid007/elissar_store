import { NextResponse, type NextRequest } from "next/server"
import { SESSION_COOKIE, verifySession } from "@/lib/admin/session"

// First gate for /admin/*. Every admin page, action and API route ALSO calls requireAdmin().
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname === "/admin/login") return NextResponse.next()
  let session = null
  try {
    session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value)
  } catch {
    /* AUTH_SECRET missing -> signed out */
  }
  if (!session) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const url = req.nextUrl.clone()
    url.pathname = "/admin/login"
    url.search = ""
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] }
