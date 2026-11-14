import { Tables } from "../database.types";
import { CLIENTS_PER_PAGE, TABLE_NAME } from "./lib/constants";
import { createClient } from "@/supabase-server";
import { removeAccents } from "./lib/utils";

const MAX_SEARCH_TERMS = 5;

// Names are stored without accents (see provisionClient), so the filter is normalized the same way.
// Characters that break PostgREST's or() syntax or act as wildcards are dropped.
const searchTerms = (filter?: string) =>
  removeAccents(filter ?? "")
    .toLowerCase()
    .replace(/[,()"\\%*:]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, MAX_SEARCH_TERMS);

interface GetClientsInput {
  page?: number;
  filter?: string;
}

// One query for the page rows and the total count. Every word must appear in the name or the email.
export const getClients = async ({ page = 1, filter }: GetClientsInput) => {
  const supabase = await createClient();
  let query = supabase
    .from(TABLE_NAME)
    .select("*", { count: "exact" })
    .neq("role", "admin");

  for (const term of searchTerms(filter)) {
    query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%`);
  }

  const start = (page - 1) * CLIENTS_PER_PAGE;
  const { data, count, error } = await query
    .order("name")
    .range(start, start + CLIENTS_PER_PAGE - 1);

  if (error) {
    console.error("Error getting clients:", error);
    throw new Error("Failed to get clients: " + error.message);
  }

  return { clients: data as Tables<"users">[], count: count ?? 0 };
};

export const getClientByEmail = async (email: string) => {
  const supabase = await createClient();
  const { data: client, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("Error getting client by email:", error);
    throw new Error("Failed to get client by email: " + error.message);
  }

  return client as Tables<"users"> | null;
};

interface ProvisionClientInput {
  email: string;
  name?: string | null;
  image?: string | null;
  role: string;
}

// Creates the client row on first login and refreshes profile data on later logins.
// `coffees` is not part of the payload, so an existing count is never overwritten.
export const provisionClient = async ({
  email,
  name,
  image,
  role,
}: ProvisionClientInput) => {
  const supabase = await createClient();

  // Needed to tell a first login (signup) from a returning one.
  const { data: existing } = await supabase
    .from(TABLE_NAME)
    .select("id")
    .eq("email", email)
    .maybeSingle();

  const { data: client, error } = await supabase
    .from(TABLE_NAME)
    .upsert(
      { email, name: removeAccents(name ?? ""), image, role },
      { onConflict: "email" }
    )
    .select("*")
    .single();

  if (error) {
    console.error("Error provisioning client:", error);
    throw new Error("Failed to provision client: " + error.message);
  }

  return { client: client as Tables<"users">, isNew: !existing };
};
