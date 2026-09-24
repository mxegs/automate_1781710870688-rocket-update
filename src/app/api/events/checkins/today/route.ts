import { NextResponse } from 'next/server';
import { mapEventRow } from '@/lib/events/mappers';
import { churchIdFromUrl } from '@/lib/church/tenant';
import { requireSessionChurch } from '@/lib/auth/session-church';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

function johannesburgDay(now = new Date()) {
  const day = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Johannesburg',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  const start = new Date(`${day}T00:00:00+02:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

function mapDependant(row: Record<string, unknown>) {
  return {
    id: row.id,
    eventId: row.event_id,
    campusId: row.campus_id ?? undefined,
    profileId: row.profile_id ?? undefined,
    memberId: row.member_id ?? undefined,
    rsvpId: row.rsvp_id ?? undefined,
    isDependant: true,
    dependantName: row.dependant_name ?? undefined,
    guardianMemberId: row.guardian_member_id ?? undefined,
    room: row.room ?? undefined,
    seat: row.seat ?? undefined,
    securityCode: row.security_code ?? undefined,
    method: row.method,
    checkedInAt: row.checked_in_at,
  };
}

export async function GET(request: Request) {
  const denied = await requireSessionChurch(request, churchIdFromUrl(request.url));
  if (denied) return denied;

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const campusId = searchParams.get('campusId');
  const profileId = searchParams.get('profileId');
  const empty = { event: null, checkin: null, dependants: [] };
  if (!profileId) return NextResponse.json(empty);

  const churchId = churchIdFromUrl(request.url);
  const { start, end } = johannesburgDay();
  let query = db
    .from('events')
    .select('*')
    .eq('church_id', churchId)
    .gte('starts_at', start)
    .lt('starts_at', end)
    .order('starts_at', { ascending: true })
    .limit(1);

  if (campusId) {
    query = query.or(`campus_id.eq.${campusId},visibility.eq.church_wide`);
  }

  const { data: events, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const eventRow = events?.[0];
  if (!eventRow) return NextResponse.json(empty);

  const { data: member } = await db
    .from('members')
    .select('id')
    .eq('profile_id', profileId)
    .eq('church_id', churchId)
    .maybeSingle();

  const { data: rows, error: checkInError } = await db
    .from('event_checkins')
    .select('*')
    .eq('event_id', eventRow.id);

  if (checkInError) return NextResponse.json({ error: checkInError.message }, { status: 500 });

  const mine = (rows ?? []).filter((row) => {
    if (row.profile_id === profileId && !row.is_dependant) return true;
    if (member?.id && row.guardian_member_id === member.id) return true;
    return false;
  });

  const primary = mine.find((row) => !row.is_dependant);
  const dependants = mine.filter((row) => row.is_dependant).map((row) => mapDependant(row));

  return NextResponse.json({
    event: mapEventRow(eventRow),
    checkin: primary
      ? {
          id: primary.id,
          eventId: primary.event_id,
          room: primary.room ?? undefined,
          seat: primary.seat ?? undefined,
          securityCode: primary.security_code ?? undefined,
          checkedInAt: primary.checked_in_at,
        }
      : null,
    dependants,
  });
}
