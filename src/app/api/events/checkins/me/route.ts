import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');
  const profileId = searchParams.get('profileId');
  if (!eventId || !profileId) {
    return NextResponse.json({ error: 'eventId and profileId are required' }, { status: 400 });
  }

  const { data, error } = await db
    .from('event_checkins')
    .select('id, event_id, room, seat, security_code, checked_in_at')
    .eq('event_id', eventId)
    .eq('profile_id', profileId)
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
