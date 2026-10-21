import Link from "next/link"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-32 text-center lg:px-10">
      <p className="label-mono text-muted-foreground">404</p>
      <h1 className="font-display mt-4 text-6xl sm:text-9xl">Page<br />introuvable</h1>
      <Link href="/shop" className="label-mono mt-12 inline-block bg-foreground px-10 py-5 text-background">Retour à la boutique</Link>
    </div>
  )
}
