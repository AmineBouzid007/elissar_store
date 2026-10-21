"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { adminConfigured, checkCredentials, endSession, requireAdmin, startSession } from "@/lib/admin/auth"
import { ORDER_STATUSES, PAYMENT_STATUSES, type OrderStatus, type PaymentStatus } from "@/lib/constants"
import { AdminError, deleteCategory, deleteProduct, productSchema, saveCategory, saveProduct, setProductActive } from "@/lib/data/admin-catalog"
import { adminDeleteOrder, adminSetOrderStatus, adminSetPaymentStatus, OrderError } from "@/lib/data/orders"
import { saveSettings } from "@/lib/data/settings"

export interface FormState {
  error?: string
  ok?: boolean
  email?: string
}

function revalidateStore() {
  revalidatePath("/", "layout")
}

// ---------- auth ----------
export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!adminConfigured()) return { error: "Admin isn't configured. Set ADMIN_EMAIL, ADMIN_PASSWORD and AUTH_SECRET." }
  const email = String(fd.get("email") ?? "")
  const password = String(fd.get("password") ?? "")
  if (!checkCredentials(email, password)) {
    await new Promise((r) => setTimeout(r, 700))
    return { error: "Incorrect email or password.", email }
  }
  await startSession(email.trim().toLowerCase())
  redirect("/admin/dashboard")
}

export async function logoutAction() {
  await endSession()
  redirect("/admin/login")
}

// ---------- orders ----------
export async function setOrderStatusAction(id: string, status: OrderStatus): Promise<FormState> {
  await requireAdmin()
  if (!ORDER_STATUSES.includes(status)) return { error: "Invalid status." }
  try {
    await adminSetOrderStatus(id, status)
  } catch (e) {
    return { error: e instanceof OrderError ? e.message : "Couldn't update the order." }
  }
  revalidatePath("/admin", "layout")
  revalidateStore()
  return { ok: true }
}

export async function setPaymentStatusAction(id: string, status: PaymentStatus): Promise<FormState> {
  await requireAdmin()
  if (!PAYMENT_STATUSES.includes(status)) return { error: "Invalid payment status." }
  await adminSetPaymentStatus(id, status)
  revalidatePath("/admin", "layout")
  return { ok: true }
}

export async function deleteOrderAction(id: string) {
  await requireAdmin()
  await adminDeleteOrder(id)
  revalidatePath("/admin", "layout")
  revalidateStore()
  redirect("/admin/orders")
}

// ---------- products ----------
export async function saveProductAction(id: string | null, raw: unknown): Promise<FormState & { id?: string }> {
  await requireAdmin()
  const parsed = productSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." }
  try {
    const pid = await saveProduct(parsed.data, id ?? undefined)
    revalidatePath("/admin", "layout")
    revalidateStore()
    return { ok: true, id: pid }
  } catch (e) {
    if (e instanceof AdminError) return { error: e.message }
    console.error("[admin] saveProduct", e)
    return { error: "Couldn't save the product." }
  }
}

export async function deleteProductAction(id: string) {
  await requireAdmin()
  await deleteProduct(id)
  revalidatePath("/admin", "layout")
  revalidateStore()
  redirect("/admin/products")
}

export async function toggleProductActiveAction(id: string, active: boolean) {
  await requireAdmin()
  await setProductActive(id, active)
  revalidatePath("/admin", "layout")
  revalidateStore()
}

// ---------- categories ----------
export async function saveCategoryAction(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin()
  try {
    await saveCategory({
      id: String(fd.get("id") ?? "") || undefined,
      name: String(fd.get("name") ?? ""),
      description: String(fd.get("description") ?? ""),
      image_url: String(fd.get("image_url") ?? ""),
      sort_order: Number(fd.get("sort_order") ?? 0) || 0,
    })
  } catch (e) {
    return { error: e instanceof AdminError ? e.message : "Couldn't save the category." }
  }
  revalidatePath("/admin", "layout")
  revalidateStore()
  return { ok: true }
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin()
  await deleteCategory(id)
  revalidatePath("/admin", "layout")
  revalidateStore()
}

// ---------- settings ----------
const settingsSchema = z.object({
  shipping_fee: z.coerce.number().min(0).max(1000),
  free_shipping_threshold: z.coerce.number().min(0).max(100000),
  announcement: z.string().trim().max(200),
  contact_email: z.string().trim().max(120),
  contact_phone: z.string().trim().max(40),
  whatsapp: z.string().trim().max(40),
  instagram: z.string().trim().max(200),
  tiktok: z.string().trim().max(200),
  hero_image: z.string().trim().max(600),
  size_chart: z.string().max(1000),
  store_open: z.boolean(),
})

export async function saveSettingsAction(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin()
  const parsed = settingsSchema.safeParse({
    ...Object.fromEntries(fd.entries()),
    store_open: fd.get("store_open") === "on",
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." }
  await saveSettings(parsed.data)
  revalidatePath("/admin", "layout")
  revalidateStore()
  return { ok: true }
}
