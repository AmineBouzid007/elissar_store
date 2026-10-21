import Link from "next/link"
import { ArrowUpRight, Ruler, Truck, Scissors, HandCoins } from "lucide-react"
import { ProductCard } from "@/components/store/product-card"
import { ProductImage } from "@/components/store/product-image"
import { getCategories, getProducts } from "@/lib/data/catalog"
import { getSettings } from "@/lib/data/settings"

const UP = "https://www.elissar.tn/wp-content/uploads/"
const TAPE = ["Jebbas hammametoises", "Caftans", "Capes brodées", "Tuniques", "Sur mesure", "Haute couture", "Fait main en Tunisie"]
const PERKS = [
  { icon: Truck, t: "Livraison offerte", d: "Partout en Tunisie, et expédition internationale." },
  { icon: Ruler, t: "Commande sur mesure", d: "Un service client VIP pour ajuster chaque pièce." },
  { icon: Scissors, t: "Retouche gratuite", d: "Dans un délai de 30 jours après la livraison." },
  { icon: HandCoins, t: "Paiement à la livraison", d: "Vous payez à la réception, en toute confiance." },
]
const QUOTES = [
  { q: "Ma première expérience Elissar était une kachabya en 2016. Aujourd'hui encore, elle rencontre un immense succès et j'ai toujours autant de plaisir à la porter.", a: "Cliente fidèle" },
  { q: "J'ai commandé de Dubaï une jebba. Reçue en une semaine, finition parfaite, conforme aux photos. Bravo Elissar.", a: "Nadia" },
  { q: "Pour mes fiançailles, j'ai porté un caftan signé Elissar. Beauté, originalité et élégance avec une superbe finition.", a: "Selima" },
]

export default async function HomePage() {
  const [products, categories, settings] = await Promise.all([getProducts(), getCategories({ onlyWithProducts: true }), getSettings()])
  const featured = (products.filter((p) => p.is_featured).length ? products.filter((p) => p.is_featured) : products).slice(0, 4)
  const hero = settings.hero_image || `${UP}2021/01/koftan-1170x600.jpg`

  return (
    <>
      {/* HERO */}
      <section className="grid min-h-[calc(100svh-7rem)] border-b border-border lg:grid-cols-[1.05fr_1fr]">
        <div className="relative flex flex-col justify-center gap-8 bg-[radial-gradient(circle_at_100%_0,#e8effb,transparent_55%)] px-5 py-16 lg:px-14">
          <h1 className="font-display fade-up text-[clamp(3.4rem,8.5vw,8rem)]">
            La signature<br />d&apos;une élégance
          </h1>
          <p className="fade-up max-w-md text-lg leading-relaxed text-muted-foreground" style={{ animationDelay: "120ms" }}>
            Des créations uniques conçues pour durer au-delà des saisons. Un mélange de retenue et d&apos;audace, moderne et traditionnel. 100 % tunisien.
          </p>
          <div className="fade-up flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "220ms" }}>
            <Link href="/shop" className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 font-medium text-primary-foreground transition-colors hover:bg-foreground">
              Découvrir les collections <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link href="/size-guide" className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/30 px-8 py-4 font-medium transition-colors hover:border-foreground">
              <Ruler className="size-4" /> Commander sur mesure
            </Link>
          </div>
        </div>
        <div className="relative min-h-[360px] bg-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hero} alt="Koftan Elissar" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-background to-transparent lg:block" />
        </div>
      </section>

      {/* MEASURING TAPE */}
      <div className="overflow-hidden border-b-2 border-foreground bg-[#f2a900] py-3 text-foreground" aria-hidden="true">
        <div className="marquee flex w-max whitespace-nowrap">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0">
              {Array.from({ length: 3 }).flatMap(() => TAPE).map((t, i) => (
                <span key={i} className="px-7 text-sm font-medium"><span className="mr-7 tracking-[-2px] opacity-50">┃ ┃ ┃ ┃</span>{t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED */}
      <section className="mx-auto max-w-[1400px] px-5 py-20 lg:px-10 lg:py-28">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-4xl sm:text-6xl">Nos pièces phares</h2>
            <p className="mt-3 text-muted-foreground">Audacieuse au travail ou détendue chez soi.</p>
          </div>
          <Link href="/shop" className="hidden items-center gap-2 border-b border-foreground pb-1 sm:inline-flex">Tout voir <ArrowUpRight className="size-4" /></Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {featured.map((p, i) => <ProductCard key={p.id} product={p} currency={settings.currency} priority={i < 2} />)}
        </div>
        <Link href="/shop" className="mt-10 block rounded-full border border-foreground/30 py-4 text-center sm:hidden">Tout voir</Link>
      </section>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="border-y border-border bg-card">
          <div className="mx-auto grid max-w-[1400px] divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3">
            {categories.map((c) => (
              <Link key={c.slug} href={`/shop?category=${c.slug}`} className="group relative flex aspect-[16/10] flex-col justify-between overflow-hidden p-6 sm:aspect-[4/3] lg:p-10">
                {c.image_url && <ProductImage src={c.image_url} alt="" className="absolute inset-0 -z-10 size-full opacity-30 transition-opacity group-hover:opacity-50" />}
                <span className="label-mono text-muted-foreground">{c.product_count} {Number(c.product_count) > 1 ? "pièces" : "pièce"}</span>
                <div className="flex items-end justify-between">
                  <h3 className="font-display text-4xl transition-transform duration-500 group-hover:translate-x-2 sm:text-5xl">{c.name}</h3>
                  <ArrowUpRight className="size-6 opacity-40 transition-opacity group-hover:opacity-100" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* STORY */}
      <section className="mx-auto grid max-w-[1400px] items-center gap-12 px-5 py-24 lg:grid-cols-2 lg:px-10 lg:py-32">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${UP}2021/01/jebbas-1170x600.jpg`} alt="Jebbas Elissar" className="size-full object-cover" />
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="font-display text-4xl sm:text-6xl">Une signature de chic dans la tradition tunisienne</h2>
          <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
            Elissar explore et revisite avec passion le patrimoine vestimentaire tunisien. Des créations variées, modernes et traditionnelles, riches en couleurs, qui apportent de la gaieté aux tenues d&apos;été comme d&apos;hiver.
          </p>
          <Link href="/about" className="inline-flex w-fit items-center gap-2 border-b border-foreground pb-1">Notre univers <ArrowUpRight className="size-4" /></Link>
        </div>
      </section>

      {/* PERKS */}
      <section className="mx-auto max-w-[1400px] px-5 pb-20 lg:px-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-2xl border border-border bg-card p-6">
              <Icon className="mb-4 size-6 text-primary" />
              <h3 className="font-display text-2xl">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-secondary py-20">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
          <h2 className="font-display mb-10 text-4xl sm:text-5xl">Faire de ses clientes, des clientes à vie</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {QUOTES.map((x) => (
              <figure key={x.a} className="rounded-2xl bg-card p-7">
                <blockquote className="font-display text-2xl leading-snug">« {x.q} »</blockquote>
                <figcaption className="mt-5 text-sm text-muted-foreground">{x.a}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
