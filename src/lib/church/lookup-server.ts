import type { SupabaseClient } from '@supabase/supabase-js';

export async function churchIdFromSlug(db: SupabaseClient, slug: string | null | undefined): Promise<string | null> {
  const value = slug?.trim().toLowerCase();
  if (!value) return null;
  const { data } = await db.from('churches').select('id').eq('slug', value).maybeSingle();
  return (data as { id?: string | null } | null)?.id?.trim() || null;
}

export async function churchIdFromSlugQuery(db: SupabaseClient, url: string): Promise<string | null> {
  return churchIdFromSlug(db, new URL(url).searchParams.get('churchSlug'));
}

export async function churchIdFromInviteToken(
  db: SupabaseClient,
  token: unknown,
): Promise<string | null> {
  if (typeof token !== 'string' || !token.trim()) return null;
  const { data } = await db
    .from('invites')
    .select('church_id')
    .eq('token', token.trim())
    .maybeSingle();
  return (data as { church_id?: string | null } | null)?.church_id?.trim() || null;
}
