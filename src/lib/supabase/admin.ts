import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function isBackendLive(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(
    url &&
      key &&
      url !== 'https://dummy.supabase.co' &&
      !key.includes('dummy'),
  );
}

/** Server-only admin client — bypasses RLS. Never import in client components. */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isBackendLive()) return null;

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
