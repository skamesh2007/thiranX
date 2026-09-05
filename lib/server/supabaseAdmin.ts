import { createClient } from "@supabase/supabase-js";

// Server-only client using the service-role key. Never import this
// file from client components. RLS is bypassed by design here —
// authorization is enforced in each API route handler instead.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);
