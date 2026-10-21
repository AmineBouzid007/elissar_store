import type { Metadata } from "next"
import { getSettings } from "@/lib/data/settings"
import { SIZES } from "@/lib/constants"

export const metadata: Metadata = { title: "Guide des tailles" }

export default async function SizeGuidePage() {
  const s = await getSettings()
  // size_chart (Admin > Réglages) : une ligne par taille -> "M,92,76,100"  (taille, poitrine, taille cm, hanches)
  const rows = s.size_chart.split("\n").map((l) => l.split(",").map((x) => x.trim())).filter((r) => r.length >= 3 && SIZES.includes(r[0] as any))
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 lg:py-20">
      <p className="label-mono mb-3 text-muted-foreground">Aide</p>
      <h1 className="font-display text-5xl sm:text-7xl">Guide des tailles</h1>
      <p className="mt-6 text-lg text-muted-foreground">Nos pièces existent en XS, S, M, L et XL. Une pièce sur mesure est possible pour la plupart des modèles.</p>
      {rows.length > 0 ? (
        <table className="mt-10 w-full overflow-hidden rounded-xl border border-border bg-card text-left">
          <thead><tr className="label-mono border-b border-border text-muted-foreground"><th className="p-4">Taille</th><th className="p-4">Poitrine (cm)</th><th className="p-4">Taille (cm)</th><th className="p-4">Hanches (cm)</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r[0]} className="border-b border-border last:border-0"><td className="font-display p-4 text-xl">{r[0]}</td><td className="p-4">{r[1]}</td><td className="p-4">{r[2]}</td><td className="p-4">{r[3] ?? ""}</td></tr>)}</tbody>
        </table>
      ) : (
        <p className="mt-10 rounded-xl border border-border bg-card p-6 text-muted-foreground">Le tableau des mensurations arrive bientôt. Un doute sur votre taille ? Écrivez-nous sur WhatsApp, nous vous conseillons.</p>
      )}
      <h2 className="font-display mt-14 text-3xl">Prendre ses mesures</h2>
      <ul className="mt-5 space-y-3 text-muted-foreground">
        <li>— Poitrine : mesurez à l&apos;endroit le plus fort, mètre à plat sous les bras.</li>
        <li>— Taille : mesurez à l&apos;endroit le plus fin du buste.</li>
        <li>— Hanches : mesurez à l&apos;endroit le plus large.</li>
        <li>— Entre deux tailles ? Prenez la plus grande, ou demandez une retouche gratuite sous 30 jours.</li>
      </ul>
    </div>
  )
}
