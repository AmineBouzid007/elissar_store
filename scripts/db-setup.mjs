// Optional: `DATABASE_URL=... npm run db:setup`
// The site also creates the tables automatically on first load, so this is only
// needed if you want to prepare the database before deploying.
import pg from "pg"

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
if (!url) { console.error("Set DATABASE_URL first."); process.exit(1) }
const u = new URL(url); u.searchParams.delete("sslmode")
const local = ["localhost", "127.0.0.1"].includes(u.hostname)
const client = new pg.Client({ connectionString: u.toString(), ssl: local ? false : { rejectUnauthorized: false } })
await client.connect()
console.log("Connected. Start the site once (npm run dev or open the deployed URL) to create tables and sample products.")
await client.end()
