import { createClient } from "@supabase/supabase-js";
const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? "";
export const supabase = createClient(
  supabaseURL ?? "https://jexmbisileqyomdwkete.supabase.co",
  supabaseAnonKey
);
