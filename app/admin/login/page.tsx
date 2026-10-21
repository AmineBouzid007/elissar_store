import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { LogoLockup } from "@/components/brand/logo"
import { adminConfigured, getSession } from "@/lib/admin/auth"
import { LoginForm } from "./login-form"

export const metadata: Metadata = { title: "Admin login", robots: { index: false } }

export default async function AdminLoginPage() {
  if (await getSession()) redirect("/admin/dashboard")
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm">
        <LogoLockup className="mx-auto h-10 w-auto text-foreground" />
        <p className="mt-6 text-center text-sm text-foreground/40">Admin</p>
        {adminConfigured() ? (
          <LoginForm />
        ) : (
          <div className="mt-8 rounded-xl border border-foreground/10 bg-card p-5 text-sm text-foreground/70">
            <p className="font-medium text-foreground">Admin isn&apos;t set up yet</p>
            <p className="mt-2">Add these environment variables in Vercel (Settings → Environment Variables), then redeploy:</p>
            <ul className="mt-3 space-y-1 font-mono text-xs text-foreground/80">
              <li>ADMIN_EMAIL</li><li>ADMIN_PASSWORD</li><li>AUTH_SECRET (32+ random characters)</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
