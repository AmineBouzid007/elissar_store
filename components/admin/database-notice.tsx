export function DatabaseNotice() {
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-foreground/10 bg-card p-8">
      <h1 className="text-xl font-semibold">Connect your database</h1>
      <p className="mt-3 text-sm text-foreground/60">The admin needs a Postgres database to store products and orders. It takes two minutes:</p>
      <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm text-foreground/80">
        <li>In Vercel open your project → <b>Storage</b> → <b>Create Database</b> → <b>Neon</b> (free tier is fine).</li>
        <li>Connect it to this project. Vercel adds <code className="rounded bg-foreground/10 px-1.5 py-0.5 text-xs">DATABASE_URL</code> automatically.</li>
        <li>Redeploy. Tables and the Drop 01 sample products are created on first load.</li>
      </ol>
    </div>
  )
}
