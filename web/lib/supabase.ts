// Browser-side Supabase client. Uses the publishable (anon) key — safe to
// expose. Server routes that only need to *validate* a user token also use
// this anon client via supabase.auth.getUser(jwt).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let _client: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient {
  if (_client) return _client;
  _client = createClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return _client;
}

// Stateless client for server routes (no session persistence) — used to
// validate a bearer token via getUser(token).
export function supabaseServer(): SupabaseClient {
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const SUPABASE_CONFIGURED = Boolean(url && anon);
