import "server-only"
import { createHash, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SESSION_COOKIE, SESSION_HOURS, signSession, verifySession } from "./session"

const h = (s: string) => createHash("sha256").update(s).digest()

export function adminConfigured() {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && (process.env.AUTH_SECRET?.length ?? 0) >= 16)
}

export function checkCredentials(email: string, password: string) {
  const okEmail = timingSafeEqual(h(email.trim().toLowerCase()), h((process.env.ADMIN_EMAIL ?? "").trim().toLowerCase()))
  const okPass = timingSafeEqual(h(password), h(process.env.ADMIN_PASSWORD ?? ""))
  return okEmail && okPass
}

export async function startSession(email: string) {
  const token = await signSession(email)
  ;(await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  })
}

export async function endSession() {
  ;(await cookies()).delete(SESSION_COOKIE)
}

export async function getSession() {
  try {
    return await verifySession((await cookies()).get(SESSION_COOKIE)?.value)
  } catch {
    return null
  }
}

/** Call at the top of every admin page, server action and API route. */
export async function requireAdmin() {
  const s = await getSession()
  if (!s) redirect("/admin/login")
  return s
}
