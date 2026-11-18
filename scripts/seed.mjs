// Loads src/db/seed.sql into the database in DATABASE_URL_UNPOOLED (Neon branch "dev" locally).
import { readFile } from "node:fs/promises";
import pg from "pg";

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) throw new Error("Set DATABASE_URL_UNPOOLED (see .env.development.local)");
if (process.env.NODE_ENV === "production") throw new Error("Refusing to seed in production");

const client = new pg.Client({ connectionString: url });
await client.connect();
await client.query(await readFile(new URL("../src/db/seed.sql", import.meta.url), "utf8"));
const { rows } = await client.query("select count(*) from public.clients");
console.log("clients:", rows[0].count);
await client.end();
