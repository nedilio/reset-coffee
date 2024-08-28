import { createClient } from "@supabase/supabase-js";
const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;
export const supabase = createClient(supabaseURL, supabaseAnonKey);

const CLIENTS_PER_PAGE = 5;

export const countClients = async () => {
  const { count, error } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });
  return count;
};

export const getClients = async (currentPage?: number, filter?: string) => {
  let query = supabase.from("users").select("*").order("name");
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
