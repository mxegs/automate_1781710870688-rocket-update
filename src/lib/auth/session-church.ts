import { NextResponse } from 'next/server';
import { readSessionEmailHeader } from '@/lib/auth/staff-access-server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

/** profiles.email is unique (profiles_email_unique_idx on lower(email)). */
export async function churchIdForSessionEmail(request: Request): Promise<string | null> {
  const email = readSessionEmailHeader(request);
  if (!email.includes('@')) return null;

  const db = getSupabaseAdmin();
  if (!db) return null;

  const { data, error } = await db
    .from('profiles')
    .select('church_id')
    .ilike('email', email)
    .limit(2);

  if (error || !data?.length) return null;
  if (data.length > 1) {
    console.warn('[session-church] more than one profile for this email; refusing');
    return null;
  }

  const id = (data[0] as { church_id?: string | null }).church_id?.trim();
  return id || null;
}

export async function requireSessionChurch(request: Request, requestedChurchId: string | null) {
  const sessionChurchId = await churchIdForSessionEmail(request);
  if (!sessionChurchId || sessionChurchId !== requestedChurchId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return null;
}
