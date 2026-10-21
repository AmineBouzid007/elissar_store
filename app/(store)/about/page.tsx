import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Notre univers" }
const UP = "https://www.elissar.tn/wp-content/uploads/"

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12 lg:px-10 lg:py-20">
      <p className="label-mono mb-3 text-muted-foreground">Notre univers</p>
      <h1 className="font-display text-5xl sm:text-8xl">Une signature de chic<br />dans la tradition tunisienne</h1>
      <div className="mt-16 grid gap-16 lg:grid-cols-2">
        <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
          <p>Elissar explore et revisite avec passion le patrimoine vestimentaire tunisien.</p>
          <p>Des créations variées pour permettre à toutes les femmes de trouver celles qui leur ressemblent. À la fois modernes et traditionnelles, riches en couleurs, nos pièces uniques et exclusives apportent de la gaieté à leurs tenues, été comme hiver.</p>
          <p><span className="text-foreground">Prêt-à-porter, haute couture, sur mesure :</span> jebbas hammametoises, caftans, capes, tuniques et ensembles, conçus pour durer au-delà des saisons.</p>
        </div>
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${UP}2021/01/jebbas-1170x600.jpg`} alt="Jebbas Elissar" className="size-full object-cover" />
        </div>
      </div>
      <Link href="/shop" className="mt-16 inline-block rounded-full bg-primary px-10 py-4 font-medium text-primary-foreground transition-colors hover:bg-foreground">Découvrir les collections</Link>
    </div>
  )
}
