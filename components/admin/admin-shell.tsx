"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { CreditCard, ExternalLink, FolderTree, LayoutDashboard, LogOut, Menu, Package, Settings, ShoppingBag, Users, X } from "lucide-react"
import { LogoMark } from "@/components/brand/logo"
import { logoutAction } from "@/app/admin/actions"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminShell({ children, email }: { children: React.ReactNode; email: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const sidebar = (
    <>
      <div className="flex h-16 items-center gap-3 px-6">
        <LogoMark className="h-8 w-auto text-primary" />
        <span className="text-sm font-semibold tracking-tight text-foreground">Elissar <span className="font-normal text-foreground/40">Admin</span></span>
        <button onClick={() => setOpen(false)} aria-label="Fermer le menu" className="ml-auto text-foreground/50 hover:text-foreground lg:hidden"><X className="size-5" /></button>
      </div>
      <nav className="mt-2 flex-1 space-y-1 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-primary text-primary-foreground" : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground")}>
              <Icon className="size-[18px]" />{label}
            </Link>
          )
        })}
      </nav>
      <div className="space-y-1 border-t border-foreground/10 px-3 py-4">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground/60 hover:bg-foreground/5 hover:text-foreground"><ExternalLink className="size-[18px]" />View store</Link>
        <form action={logoutAction}>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground/60 hover:bg-foreground/5 hover:text-foreground"><LogOut className="size-[18px]" />Sign out</button>
        </form>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-foreground/10 lg:flex">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} aria-hidden="true" />
          <aside className="relative flex h-full w-64 flex-col border-r border-foreground/10 bg-background">{sidebar}</aside>
        </div>
      )}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-foreground/10 bg-background/95 px-4 backdrop-blur sm:px-6">
          <button onClick={() => setOpen(true)} aria-label="Ouvrir le menu" className="text-foreground/70 hover:text-foreground lg:hidden"><Menu className="size-5" /></button>
          <LogoMark className="h-7 w-auto text-primary lg:hidden" />
          <div className="ml-auto text-right"><p className="text-sm font-medium leading-tight">Admin</p><p className="text-xs leading-tight text-foreground/40">{email}</p></div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
