import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import "@fontsource-variable/cormorant-garamond/index.css"
import "@fontsource-variable/outfit/index.css"
import "./globals.css"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Elissar — Vêtements traditionnels tunisiens et modernes", template: "%s — Elissar" },
  description: "Elissar, maison de couture tunisienne : jebbas, caftans, capes, tuniques et haute couture. Livraison en Tunisie, paiement à la livraison, sur mesure.",
  openGraph: {
    title: "Elissar — La signature d'une élégance",
    description: "Des créations uniques et authentiques, 100 % tunisiennes.",
    siteName: "Elissar",
    type: "website",
    locale: "fr_TN",
  },
}

export const viewport: Viewport = { themeColor: "#1f4fa3", colorScheme: "light" }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {children}
        <Toaster position="top-center" />
        <Analytics />
      </body>
    </html>
  )
}
