import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Database } from "../database.types";

// Server-only client that uses the service role key, which bypasses Row Level Security.
// Tables stay locked for the public anon key (RLS enabled, no policies) and only this
// server code can read or write them. Never import this file from a Client Component.
export const createClient = async () =>
  createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
