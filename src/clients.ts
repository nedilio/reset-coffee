import { Tables } from "../database.types";
import { CLIENTS_PER_PAGE, TABLE_NAME } from "./lib/constants";
import { createClient } from "@/supabase-server";

const createBaseQuery = async (
  supabase: ReturnType<typeof createClient>,
  filter?: string,
  isCountQuery: boolean = false
) => {
  let query = supabase.from(TABLE_NAME);
  if (isCountQuery) {
    query = query.select("*", { count: "exact", head: true });
  } else {
    query = query.select("*");
  }
  query = query.neq("role", "admin");
  if (filter) {
    query = query.ilike("name", `%${filter}%`);
  }
  return query;
};

export const countClients = async (filter: string) => {
  const supabase = await createClient();
  const query = await createBaseQuery(supabase, filter, true);

  const { count, error } = await query;
  if (error) {
    console.error("Error counting clients:", error);
    throw new Error("Failed to count clients: " + error.message);
  }
  return count;
};

export const getClients = async (currentPage?: number, filter?: string) => {
  const supabase = await createClient();
  let query = await createBaseQuery(supabase, filter, false);

  query = query.order("name");

  if (currentPage) {
    const start = (currentPage - 1) * CLIENTS_PER_PAGE;
    const end = currentPage * CLIENTS_PER_PAGE - 1;
    query = query.range(start, end);
  }

  const { data: clients, error } = await query;

  if (error) {
    console.error("Error getting clients:", error);
    throw new Error("Failed to get clients: " + error.message);
  }

  return clients as Tables<"users">[];
};
