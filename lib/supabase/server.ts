import { createClient } from '@supabase/supabase-js';

// Server-only client — only import from Server Components and Server Actions.
//
// Preferred: SUPABASE_SERVICE_ROLE_KEY (bypasses RLS; the intended posture for
// this internal 3-person tool). Fastest safe path — the secret never reaches the
// browser.
//
// Fallback: SUPABASE_ANON_KEY. Used only when the service-role key isn't set
// (e.g. an MVP deploy where the secret hasn't been pasted in yet). This runs as
// the `anon` Postgres role, so it depends on the anon RLS policies in migration
// 0003. To restore the hardened posture, set SUPABASE_SERVICE_ROLE_KEY and drop
// the anon policies (0003) — or move to Supabase Auth. Neither key is prefixed
// NEXT_PUBLIC_, so both stay server-side.
// Public MVP fallbacks so a zero-config deploy works out of the box. The URL is
// public and the anon key is the RLS-gated public key (protected by the anon
// policies in migration 0003) — the same values a normal Supabase frontend ships
// to the browser. Env vars ALWAYS win: set SUPABASE_SERVICE_ROLE_KEY to restore
// the hardened RLS-bypass posture, or point these at a different project.
const FALLBACK_URL = 'https://vabxprioxgklkjeytbvh.supabase.co';
const FALLBACK_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhYnhwcmlveGdrbGtqZXl0YnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNzM3NTQsImV4cCI6MjA5ODk0OTc1NH0.Vbr_1gge8JZOVmIKwqUWQdyNJ1ZGjbM-psinlAcznzI';

export const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? FALLBACK_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? FALLBACK_ANON,
    { auth: { persistSession: false } }
  );
