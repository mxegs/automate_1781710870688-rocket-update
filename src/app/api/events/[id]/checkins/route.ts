import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

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
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const { id } = await params;
  const { data, error } = await db
    .from('event_checkins')
    .select('*')
    .eq('event_id', id)
    .order('checked_in_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map((row) => mapRow(row)));
}
