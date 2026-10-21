import type { Metadata } from "next"
import { Instagram, Mail, MessageCircle, Phone } from "lucide-react"
import { getSettings } from "@/lib/data/settings"

export const metadata: Metadata = { title: "Contact" }

export default async function ContactPage() {
  const s = await getSettings()
  const ig = s.instagram ? (s.instagram.startsWith("http") ? s.instagram : `https://instagram.com/${s.instagram.replace(/^@/, "")}`) : ""
  const wa = s.whatsapp ? `https://wa.me/${s.whatsapp.replace(/[^\d]/g, "")}` : ""
  const rows = [
    { icon: MessageCircle, label: "WhatsApp", value: s.whatsapp, href: wa },
    { icon: Instagram, label: "Instagram", value: s.instagram, href: ig },
    { icon: Phone, label: "Téléphone", value: s.contact_phone, href: s.contact_phone ? `tel:${s.contact_phone.replace(/\s/g, "")}` : "" },
    { icon: Mail, label: "E-mail", value: s.contact_email, href: s.contact_email ? `mailto:${s.contact_email}` : "" },
  ].filter((r) => r.value)
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 lg:py-20">
      <p className="label-mono mb-3 text-muted-foreground">Contact</p>
      <h1 className="font-display text-5xl sm:text-7xl">Parlons-nous</h1>
      <p className="mt-6 text-lg text-muted-foreground">Une question sur une taille, une commande ou une pièce sur mesure ? Écrivez-nous. Boutique : 90 avenue Jugurtha, Mutuelleville, à côté de Elixir Bio.</p>
      {rows.length === 0 ? (
        <p className="mt-12 rounded-xl border border-border p-6 text-muted-foreground">Les coordonnées arrivent bientôt.</p>
      ) : (
        <ul className="mt-12 divide-y divide-border rounded-xl border border-border">
          {rows.map(({ icon: Icon, label, value, href }) => (
            <li key={label}>
              <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="group flex items-center gap-5 p-6 transition-colors hover:bg-accent">
                <Icon className="size-5" />
                <div><p className="label-mono text-muted-foreground">{label}</p><p className="font-display mt-1 text-lg">{value}</p></div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
