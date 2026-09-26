import { NextResponse } from 'next/server';
import { churchIdForSessionEmail } from '@/lib/auth/session-church';
import { readSessionEmailHeader } from '@/lib/auth/staff-access-server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

function notFound() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function GET(request: Request) {
  const eventId = new URL(request.url).searchParams.get('eventId');
  if (!eventId) {
    return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
  }

  const churchId = await churchIdForSessionEmail(request);
  if (!churchId) return notFound();

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const { data: event } = await db
    .from('events')
    .select('id, church_id')
    .eq('id', eventId)
    .maybeSingle();
  if (!event || event.church_id !== churchId) return notFound();

  const email = readSessionEmailHeader(request);
  const { data: profile } = await db
    .from('profiles')
    .select('id')
    .ilike('email', email)
    .eq('church_id', churchId)
    .maybeSingle();
  if (!profile) return notFound();

  const { data, error } = await db
    .from('event_checkins')
    .select('id, event_id, room, seat, security_code, checked_in_at')
    .eq('event_id', eventId)
    .eq('profile_id', profile.id)
    .eq('is_dependant', false)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json(null);

  return NextResponse.json({
    id: data.id,
    eventId: data.event_id,
    room: data.room ?? undefined,
    seat: data.seat ?? undefined,
    securityCode: data.security_code ?? undefined,
    checkedInAt: data.checked_in_at,
  });
}
