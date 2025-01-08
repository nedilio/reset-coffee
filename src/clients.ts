import { CLIENTS_PER_PAGE, TABLE_NAME } from "./lib/constants";
import { createClient } from "./supabase-server";

export const countClients = async (filter: string) => {
  const supabase = await createClient();
  const query = supabase
    .from(TABLE_NAME)
    .select("*", { count: "exact", head: true })
    .neq("role", "admin");
  if (filter) {
    query.ilike("name", `%${filter}%`);
  }

  const { count, error } = await query;
  return count;
};

export const getClients = async (currentPage?: number, filter?: string) => {
  const supabase = await createClient();

  let query = supabase
    .from(TABLE_NAME)
    .select("*")
    .neq("role", "admin")
    .order("name");
  if (filter) {
    query = query.ilike("name", `%${filter}%`);
  }
  if (currentPage) {
    const start = (currentPage - 1) * CLIENTS_PER_PAGE;
    const end = currentPage * CLIENTS_PER_PAGE - 1;
    query = query.range(start, end);
  }

  try {
    const { data: clients, error } = await query;
    return clients;
  } catch (error) {
    console.error("error", error);
  }
};
