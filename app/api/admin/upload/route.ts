import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { getSession } from "@/lib/admin/auth"

export const runtime = "nodejs"

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"]

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Uploads aren't enabled. In Vercel: Storage → Create → Blob, connect it to this project (or paste an image URL / /products/file.jpg path instead)." },
      { status: 501 },
    )
  }
  const form = await req.formData()
  const file = form.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 })
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Use a JPG, PNG, WebP or AVIF image." }, { status: 400 })
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "Image is over 4 MB. Please compress it." }, { status: 400 })
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(-60)
  const blob = await put(`products/${Date.now()}-${safe}`, file, { access: "public", addRandomSuffix: true })
  return NextResponse.json({ url: blob.url })
}
