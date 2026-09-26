import { NextResponse } from 'next/server';
import { churchIdForSessionEmail } from '@/lib/auth/session-church';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

function notFound() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

function mapRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    eventId: row.event_id,
    campusId: row.campus_id ?? undefined,
    profileId: row.profile_id ?? undefined,
    memberId: row.member_id ?? undefined,
    rsvpId: row.rsvp_id ?? undefined,
    isDependant: Boolean(row.is_dependant),
    dependantName: row.dependant_name ?? undefined,
    guardianMemberId: row.guardian_member_id ?? undefined,
    room: row.room ?? undefined,
    seat: row.seat ?? undefined,
    securityCode: row.security_code ?? undefined,
    method: row.method,
    checkedInAt: row.checked_in_at,
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const churchId = await churchIdForSessionEmail(request);
  if (!churchId) return notFound();

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const { id } = await params;
  const { data: event, error: eventError } = await db
    .from('events')
    .select('id, church_id')
    .eq('id', id)
    .maybeSingle();

  if (eventError) return NextResponse.json({ error: eventError.message }, { status: 500 });
  if (!event || event.church_id !== churchId) return notFound();

  const searchParams = new URL(request.url).searchParams;
  const isDependantParam = searchParams.get('isDependant');
  const room = searchParams.get('room');
  const search = searchParams.get('search')?.trim() ?? '';
  const campusId = searchParams.get('campusId');

  let query = db
    .from('event_checkins')
    .select('*')
    .eq('event_id', id)
    .order('checked_in_at', { ascending: true });

  if (isDependantParam === 'true') query = query.eq('is_dependant', true);
  if (isDependantParam === 'false') query = query.eq('is_dependant', false);
  if (room) query = query.eq('room', room);
  if (campusId) query = query.eq('campus_id', campusId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let rows = data ?? [];
  if (search) {
    const needle = search.toLowerCase();
    const memberIds = [
      ...new Set(
        rows
          .filter((row) => !row.is_dependant && row.member_id)
          .map((row) => row.member_id as string),
      ),
    ];
    const nameByMemberId = new Map<string, string>();
    if (memberIds.length > 0) {
      const { data: members } = await db
        .from('members')
        .select('id, full_name, surname')
        .in('id', memberIds);
      for (const member of members ?? []) {
        nameByMemberId.set(
          member.id,
          `${member.full_name ?? ''} ${member.surname ?? ''}`.trim().toLowerCase(),
        );
      }
    }
    rows = rows.filter((row) => {
      if (row.is_dependant) {
        return String(row.dependant_name ?? '').toLowerCase().includes(needle);
      }
      return (nameByMemberId.get(row.member_id as string) ?? '').includes(needle);
    });
  }

  return NextResponse.json(rows.map((row) => mapRow(row)));
}
