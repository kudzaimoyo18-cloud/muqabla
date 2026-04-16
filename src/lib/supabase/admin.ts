import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Admin client with service_role key — bypasses RLS, use only in server-side code.
//
// Lazily instantiates on first method call so this module can be imported
// during Next.js's "Collecting page data" build phase even when env vars are
// not present in the build environment (e.g. preview projects without
// production secrets configured). Without lazy init, the build crashes with
// "supabaseUrl is required" before any handler is ever called.

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Supabase admin client is not configured: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in this environment.',
    );
  }
  _client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return _client;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, _receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === 'function' ? value.bind(client) : value;
  },
}) as SupabaseClient;
