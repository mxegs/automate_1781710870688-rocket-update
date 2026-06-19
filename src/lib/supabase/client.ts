/**
 * Supabase client placeholder.
 * Install @supabase/supabase-js and uncomment the createClient call when wiring the backend.
 */

export const supabaseConfigured =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://dummy.supabase.co' &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.includes('dummykey');

/** Returns null until Supabase is configured — callers should fall back to demo/local storage. */
export function getSupabaseClient(): null {
  if (!supabaseConfigured) return null;
  // import { createClient } from '@supabase/supabase-js';
  // return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  return null;
}
