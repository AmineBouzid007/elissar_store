import Link from "next/link"
import { Instagram } from "lucide-react"
import { LogoLockup, LogoMark } from "@/components/brand/logo"
import type { StoreSettings } from "@/lib/types"

export function Footer({ settings, categories }: { settings: StoreSettings; categories: { name: string; slug: string }[] }) {
  const ig = settings.instagram ? (settings.instagram.startsWith("http") ? settings.instagram : `https://instagram.com/${settings.instagram.replace(/^@/, "")}`) : ""
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border">
      <LogoMark className="pointer-events-none absolute -right-10 -top-10 h-[420px] w-auto text-foreground/[0.03]" />
      <div className="relative mx-auto grid max-w-[1400px] gap-12 px-5 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
        <div>
          <LogoLockup className="h-9 w-auto" />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Maison de couture tunisienne. Des pièces uniques qui revisitent le patrimoine vestimentaire, entre tradition et modernité.
          </p>
          {ig && (
            <a href={ig} target="_blank" rel="noopener noreferrer" className="label-mono mt-6 inline-flex items-center gap-2 text-foreground/70 hover:text-foreground">
              <Instagram className="size-4" /> Instagram
            </a>
          )}
        </div>
        <div>
          <h3 className="label-mono mb-5 text-muted-foreground">Boutique</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/shop" className="hover:underline">Toutes les pièces</Link></li>
            {categories.map((c) => (
              <li key={c.slug}><Link href={`/shop?category=${c.slug}`} className="hover:underline">{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="label-mono mb-5 text-muted-foreground">Aide</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/size-guide" className="hover:underline">Guide des tailles</Link></li>
            <li><Link href="/shipping-returns" className="hover:underline">Livraison &amp; retouches</Link></li>
            <li><Link href="/track" className="hover:underline">Suivre ma commande</Link></li>
            <li><Link href="/contact" className="hover:underline">Coordonnées</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="label-mono mb-5 text-muted-foreground">Elissar</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/about" className="hover:underline">Notre univers</Link></li>
            <li className="text-muted-foreground">Paiement à la livraison</li>
            <li className="text-muted-foreground">Livraison partout en Tunisie</li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-border">
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-2 px-5 py-5 text-xs text-muted-foreground sm:flex-row lg:px-10">
          <span className="label-mono">© {new Date().getFullYear()} Elissar</span>
          <span className="label-mono">90 avenue Jugurtha, Mutuelleville, Tunis</span>
        </div>
      </div>
    </footer>
  )
}
