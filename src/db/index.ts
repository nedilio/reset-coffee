import "server-only";
import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// One pool per server instance, kept across hot reloads in dev. DATABASE_URL is Neon's pooled URL.
const globalForDb = globalThis as unknown as { pgPool?: Pool };
const pool =
  globalForDb.pgPool ??
  new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
if (process.env.NODE_ENV !== "production") globalForDb.pgPool = pool;
attachDatabasePool(pool);

export const db = drizzle(pool, { schema });
