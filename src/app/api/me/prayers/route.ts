import { NextResponse } from 'next/server';
import { readSessionEmailHeader } from '@/lib/auth/staff-access-server';
import { sessionProfileDenied, sessionProfileFromRequest } from '@/lib/notifications/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

function truncateBody(value: string, max = 120): string {
  const text = value.trim();
  if (text.length <= max) return text;
  return text.slice(0, max);
}

function mapRow(row: Record<string, unknown>) {
  const description = String(row.description ?? '');
  const answeredAt =
    typeof row.answered_at === 'string' && row.answered_at ? row.answered_at : null;
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    body: truncateBody(description),
    fullBody: description,
    isConfidential: Boolean(row.is_confidential),
    status: String(row.status ?? 'new'),
    createdAt: String(row.created_at ?? ''),
    answeredAt,
  };
}

export async function GET(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const session = await sessionProfileFromRequest(request);
  if (!session) return sessionProfileDenied();

  const email = readSessionEmailHeader(request);

  const { data: byProfile, error: profileError } = await db
    .from('prayer_requests')
    .select('id, title, description, is_confidential, status, created_at, profile_id, church_id, contact_email')
    .eq('church_id', session.churchId)
    .eq('profile_id', session.id)
    .order('created_at', { ascending: false });

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

  const { data: byEmail, error: emailError } = await db
    .from('prayer_requests')
    .select('id, title, description, is_confidential, status, created_at, profile_id, church_id, contact_email')
    .eq('church_id', session.churchId)
    .ilike('contact_email', email)
    .order('created_at', { ascending: false });

  if (emailError) return NextResponse.json({ error: emailError.message }, { status: 500 });

  const map = new Map<string, Record<string, unknown>>();
  for (const row of [...(byProfile ?? []), ...(byEmail ?? [])] as Record<string, unknown>[]) {
    if (String(row.church_id) !== session.churchId) continue;
    const profileId = typeof row.profile_id === 'string' ? row.profile_id : '';
    const contactEmail = String(row.contact_email ?? '').toLowerCase();
    if (profileId !== session.id && contactEmail !== email.toLowerCase()) continue;
    map.set(String(row.id), row);
  }

  const prayers = [...map.values()]
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    .map(mapRow);

  return NextResponse.json({ prayers });
}
