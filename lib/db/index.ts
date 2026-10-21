import "server-only"
import { Pool, type PoolClient, type QueryResultRow } from "pg"
import { SCHEMA_SQL, SCHEMA_VERSION } from "./schema"

declare global {
  // eslint-disable-next-line no-var
  var __noctPool: Pool | undefined
  // eslint-disable-next-line no-var
  var __noctReady: Promise<void> | undefined
}

function connectionString() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || ""
}

export function isDbConfigured() {
  return Boolean(connectionString())
}

function getPool(): Pool {
  if (globalThis.__noctPool) return globalThis.__noctPool
  const raw = connectionString()
  if (!raw) throw new Error("DATABASE_URL is not set")
  let cs = raw
  let local = false
  try {
    const u = new URL(raw)
    local = ["localhost", "127.0.0.1", "::1"].includes(u.hostname)
    u.searchParams.delete("sslmode")
    cs = u.toString()
  } catch {
    /* keep raw */
  }
  globalThis.__noctPool = new Pool({
    connectionString: cs,
    ssl: local ? false : { rejectUnauthorized: false },
    max: 4,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  })
  globalThis.__noctPool.on("error", (e) => console.error("[db] idle client error", e.message))
  return globalThis.__noctPool
}

/** Creates tables + sample data the first time. Safe to call many times. */
async function ensureSchema() {
  const pool = getPool()
  const client = await pool.connect()
  try {
    let current = 0
    try {
      const r = await client.query(`select value from settings where key = 'schema_version'`)
      current = Number(r.rows[0]?.value ?? 0)
    } catch {
      current = 0
    }
    if (current >= SCHEMA_VERSION) return
    await client.query(`select pg_advisory_lock(74281930)`)
    try {
      await client.query(SCHEMA_SQL)
      const { seedDatabase } = await import("./seed")
      await seedDatabase(client)
      await client.query(
        `insert into settings (key, value) values ('schema_version', $1::jsonb)
         on conflict (key) do update set value = excluded.value`,
        [JSON.stringify(SCHEMA_VERSION)],
      )
    } finally {
      await client.query(`select pg_advisory_unlock(74281930)`)
    }
  } finally {
    client.release()
  }
}

function ready() {
  if (!globalThis.__noctReady) {
    globalThis.__noctReady = ensureSchema().catch((e) => {
      globalThis.__noctReady = undefined
      throw e
    })
  }
  return globalThis.__noctReady
}

export async function query<T extends QueryResultRow = any>(text: string, params: unknown[] = []): Promise<T[]> {
  await ready()
  const res = await getPool().query<T>(text, params as any[])
  return res.rows
}

export async function withTx<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  await ready()
  const client = await getPool().connect()
  try {
    await client.query("begin")
    const out = await fn(client)
    await client.query("commit")
    return out
  } catch (e) {
    try {
      await client.query("rollback")
    } catch {
      /* ignore */
    }
    throw e
  } finally {
    client.release()
  }
}
