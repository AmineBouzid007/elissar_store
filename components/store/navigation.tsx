"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, Search, ShoppingBag, X } from "lucide-react"
import { LogoWordmark } from "@/components/brand/logo"
import { useCart } from "@/lib/cart-context"
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet"

interface Props {
  categories: { name: string; slug: string }[]
}

export function Navigation({ categories }: Props) {
  const { count, open } = useCart()
  const [menu, setMenu] = useState(false)

  const links = [
    { href: "/shop", label: "Boutique" },
    ...categories.map((c) => ({ href: `/shop?category=${c.slug}`, label: c.name })),
    { href: "/about", label: "Notre univers" },
    { href: "/track", label: "Suivre ma commande" },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-6 px-5 lg:px-10">
        <button className="-ml-2 p-2 md:hidden" aria-label="Ouvrir le menu" onClick={() => setMenu(true)}>
          <Menu className="size-5" />
        </button>

        <Link href="/" aria-label="Elissar, accueil" className="shrink-0">
          <LogoWordmark className="h-[18px] w-auto text-foreground md:h-5" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
          {links.slice(0, 1 + categories.length).map((l) => (
            <Link key={l.href} href={l.href} className="label-mono text-foreground/60 transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
          <Link href="/about" className="label-mono text-foreground/60 transition-colors hover:text-foreground">Notre univers</Link>
          <Link href="/track" className="label-mono text-foreground/60 transition-colors hover:text-foreground">Suivre ma commande</Link>
        </nav>

        <div className="flex items-center gap-1">
          <Link href="/shop" aria-label="Rechercher" className="hidden p-2 text-foreground/70 hover:text-foreground md:block">
            <Search className="size-[18px]" />
          </Link>
          <button onClick={open} aria-label={`Ouvrir le panier, ${count} articles`} className="relative p-2 text-foreground/80 hover:text-foreground">
            <ShoppingBag className="size-[18px]" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center bg-foreground font-mono text-[9px] font-bold text-background">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>
        </div>
      </div>

      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent side="left" className="w-[85vw] max-w-sm border-border bg-background p-0 [&>button]:hidden">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">Navigation du site</SheetDescription>
          <div className="flex h-16 items-center justify-between border-b border-border px-5">
            <LogoWordmark className="h-[18px] w-auto" />
            <button aria-label="Fermer le menu" onClick={() => setMenu(false)} className="-mr-2 p-2">
              <X className="size-5" />
            </button>
          </div>
          <nav className="flex flex-col px-5 py-6">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMenu(false)} className="font-display border-b border-border py-5 text-3xl">
                {l.label}
              </Link>
            ))}
            <Link href="/contact" onClick={() => setMenu(false)} className="font-display border-b border-border py-5 text-3xl">Coordonnées</Link>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  )
}
