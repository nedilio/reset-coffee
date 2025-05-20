import { Tables } from "../database.types";
import { CLIENTS_PER_PAGE, TABLE_NAME } from "./lib/constants";
import { createClient } from "@/supabase-server";

const createBaseQuery = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  filter: string = "",
  isCountQuery: boolean = false
) => {
  const query = supabase.from(TABLE_NAME);
  if (isCountQuery) {
    query
      .select("*", { count: "exact", head: true })
      .neq("role", "admin")
      .ilike("name", `%${filter}%`);
    return query;
  } else {
    query.select("*").neq("role", "admin").ilike("name", `%${filter}%`);
    return query;
  }
};

export const countClients = async (filter: string) => {
  const supabase = await createClient();
  // const query = await createBaseQuery(supabase, filter, true);
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
    .single();

  if (error) {
    console.error("Error getting client by email:", error);
    throw new Error("Failed to get client by email: " + error.message);
  }

  return client as Tables<"users">;
};
