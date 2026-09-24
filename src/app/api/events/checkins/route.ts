import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

function fourDigitCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
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

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const body = await request.json();
  if (!body.eventId) return NextResponse.json({ error: 'eventId is required' }, { status: 400 });

  const { data: event, error: eventError } = await db
    .from('events')
    .select('id, campus_id')
    .eq('id', body.eventId)
    .maybeSingle();

  if (eventError) return NextResponse.json({ error: eventError.message }, { status: 500 });
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  const securityCode = fourDigitCode();
  const method = body.method ?? 'self';
  const primaryRow = {
    event_id: body.eventId,
    campus_id: event.campus_id,
    profile_id: body.profileId ?? null,
    member_id: body.memberId ?? null,
    rsvp_id: body.rsvpId ?? null,
    is_dependant: false,
    room: body.room ?? null,
    seat: body.seat ?? null,
    security_code: securityCode,
    method,
  };

  const write = body.memberId
    ? db.from('event_checkins').upsert(primaryRow, { onConflict: 'event_id,member_id' }).select('*').single()
    : db.from('event_checkins').insert(primaryRow).select('*').single();

  const { data: primary, error } = await write;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const dependants = [];
  for (const child of body.dependants ?? []) {
    if (!child?.name?.trim()) continue;
    const { data, error: childError } = await db
      .from('event_checkins')
      .insert({
        event_id: body.eventId,
        campus_id: event.campus_id,
        is_dependant: true,
        dependant_name: child.name.trim(),
        guardian_member_id: body.memberId ?? null,
        room: child.room ?? body.room ?? null,
        security_code: securityCode,
        method,
      })
      .select('*')
      .single();
    if (childError) return NextResponse.json({ error: childError.message }, { status: 500 });
    dependants.push(mapRow(data));
  }

  return NextResponse.json({ primary: mapRow(primary), dependants });
}
