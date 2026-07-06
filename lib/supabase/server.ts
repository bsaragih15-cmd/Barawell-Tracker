import { createClient } from '@supabase/supabase-js';

// Server-only client. The service-role key bypasses RLS and must never reach the
// browser — only import this in Server Components and Server Actions.
// For an internal 3-person tool this is the fastest safe path. To open the app to
// end-users later, switch to Supabase Auth + the anon key and lean on the RLS
// policies defined in the migration.
export const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
