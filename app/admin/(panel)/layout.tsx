import { redirect } from "next/navigation"
import { AdminShell } from "@/components/admin/admin-shell"
import { getSession } from "@/lib/admin/auth"
import { isDbConfigured } from "@/lib/db"
import { DatabaseNotice } from "@/components/admin/database-notice"

export const dynamic = "force-dynamic"
export const metadata = { title: { default: "Admin", template: "%s — Elissar Admin" }, robots: { index: false } }

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect("/admin/login")
  return (
    <AdminShell email={session.email}>
      {isDbConfigured() ? children : <DatabaseNotice />}
    </AdminShell>
  )
}
