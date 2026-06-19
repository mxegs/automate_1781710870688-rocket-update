import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

export const supabaseConfigured =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://dummy.supabase.co' &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.includes('dummykey');

let browserClient: SupabaseClient<Database> | null = null;

/** Browser/client-side Supabase instance. Returns null when env keys are not set. */
export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (!supabaseConfigured) return null;

  if (!browserClient) {
    browserClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }

  return browserClient;
}

/** Server-side client (Route Handlers, Server Actions). Pass cookies/headers when auth is wired. */
export function createServerSupabaseClient(): SupabaseClient<Database> | null {
  if (!supabaseConfigured) return null;

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
