import { and, asc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import { CLIENTS_PER_PAGE } from "./lib/constants";
import { db } from "@/db";
import { clients, type Client } from "@/db/schema";
import { removeAccents } from "./lib/utils";
import { isUuid } from "./lib/uuid";

export type { Client };

const MAX_SEARCH_TERMS = 5;

// Names are stored without accents (see provisionClient), so the filter is normalized the same way.
// LIKE wildcards typed by the user are escaped so they match literally.
const searchTerms = (filter?: string) =>
  removeAccents(filter ?? "")
    .toLowerCase()
    .replace(/[\\%_]/g, "\\$&")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, MAX_SEARCH_TERMS);

interface GetClientsInput {
  page?: number;
  filter?: string;
}

// One query for the page rows and the total count. Every word must appear in the name or the email.
export const getClients = async ({ page = 1, filter }: GetClientsInput) => {
  const where = and(
    ...searchTerms(filter).map((term) =>
      or(ilike(clients.name, `%${term}%`), ilike(clients.email, `%${term}%`))
    )
  );

  const rows = await db
    .select({ client: clients, total: sql<number>`count(*) over()`.mapWith(Number) })
    .from(clients)
    .where(where)
    .orderBy(asc(clients.name))
    .limit(CLIENTS_PER_PAGE)
    .offset((page - 1) * CLIENTS_PER_PAGE);

  if (rows.length > 0) {
    return { clients: rows.map((r) => r.client), count: rows[0].total };
  }
  // An empty page can still have matches (page beyond the last one): ask for the real total.
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(clients)
    .where(where);
  return { clients: [] as Client[], count };
};

export const getClientByEmail = async (email: string) => {
  const [client] = await db.select().from(clients).where(eq(clients.email, email));
  return client ?? null;
};

export const getClientById = async (id: string) => {
  if (!isUuid(id)) return null;
  const [client] = await db.select().from(clients).where(eq(clients.id, id));
  return client ?? null;
};

interface ProvisionClientInput {
  email: string;
  name?: string | null;
  image?: string | null;
}

// Creates the client row on first login and refreshes profile data on later logins.
// Counters are not part of the payload, so an existing count is never overwritten.
export const provisionClient = async ({ email, name, image }: ProvisionClientInput) => {
  const [row] = await db
    .insert(clients)
    .values({ email, name: removeAccents(name ?? ""), image })
    .onConflictDoUpdate({
      target: clients.email,
      set: { name: removeAccents(name ?? ""), image },
    })
    // xmax is 0 only on rows this statement inserted, which tells a signup from a returning login.
    .returning({ ...getTableColumns(clients), inserted: sql<boolean>`(xmax = 0)` });

  const { inserted, ...client } = row;
  return { client: client as Client, isNew: inserted };
};
