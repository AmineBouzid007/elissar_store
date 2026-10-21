// Edge/Node-safe session helpers (used by proxy.ts and server code).
import { SignJWT, jwtVerify } from "jose"

export const SESSION_COOKIE = "noct_admin"
export const SESSION_HOURS = 12

function key() {
  const s = process.env.AUTH_SECRET
  if (!s || s.length < 16) throw new Error("AUTH_SECRET is missing or shorter than 16 characters.")
  return new TextEncoder().encode(s)
}

export async function signSession(email: string) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(key())
}

export async function verifySession(token: string | undefined): Promise<{ email: string } | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] })
    return { email: String(payload.email) }
  } catch {
    return null
  }
}
