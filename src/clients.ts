import { Tables } from "../database.types";
import { CLIENTS_PER_PAGE, TABLE_NAME } from "./lib/constants";
import { createClient } from "@/supabase-server";
import { removeAccents } from "./lib/utils";

export const countClients = async (filter: string) => {
  const supabase = await createClient();
  const query = supabase
    .from(TABLE_NAME)
    .select("*", { count: "exact", head: true })
    .neq("role", "admin")
    .ilike("name", `%${filter}%`);

  const { count, error } = await query;
  if (error) {
    console.error("Error counting clients:", error);
    throw new Error("Failed to count clients: " + error.message);
  }
  return count;
};

export const getClients = async (currentPage?: number, filter?: string) => {
  const supabase = await createClient();
  const query = supabase
    .from(TABLE_NAME)
    .select("*")
    .neq("role", "admin")
    .ilike("name", `%${filter}%`);

  query.order("name");

  if (currentPage) {
    const start = (currentPage - 1) * CLIENTS_PER_PAGE;
    const end = currentPage * CLIENTS_PER_PAGE - 1;
    query.range(start, end);
  }

  const { data: clients, error } = await query;

  if (error) {
    console.error("Error getting clients:", error);
    throw new Error("Failed to get clients: " + error.message);
  }

  return clients as Tables<"users">[];
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

  return client as Tables<"users">;
};
