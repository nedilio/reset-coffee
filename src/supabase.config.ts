import { createClient } from "@supabase/supabase-js";
import { CLIENTS_PER_PAGE, TABLE_NAME } from "./lib/constants";
const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;
export const supabase = createClient(supabaseURL, supabaseAnonKey);

export const countClients = async (filter: string) => {
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
