import type { SupabaseClient } from '@supabase/supabase-js';
import { roomForChildAge } from './rooms';

/** May move to src/lib/events/types.ts later. Named EventCheckin to match this API. */
export type EventCheckin = {
  id: string;
  eventId: string;
  campusId?: string;
  profileId?: string;
  memberId?: string;
  rsvpId?: string;
  isDependant: boolean;
  dependantName?: string;
  guardianMemberId?: string;
  room?: string | null;
  seat?: string;
  securityCode?: string;
  method: 'self' | 'kiosk' | 'scanner' | 'staff';
  checkedInAt: string;
};

function fourDigitCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function mapRow(row: Record<string, unknown>): EventCheckin {
  return {
    id: row.id as string,
    eventId: row.event_id as string,
    campusId: (row.campus_id as string | null) ?? undefined,
    profileId: (row.profile_id as string | null) ?? undefined,
    memberId: (row.member_id as string | null) ?? undefined,
    rsvpId: (row.rsvp_id as string | null) ?? undefined,
    isDependant: Boolean(row.is_dependant),
    dependantName: (row.dependant_name as string | null) ?? undefined,
    guardianMemberId: (row.guardian_member_id as string | null) ?? undefined,
    room: (row.room as string | null) ?? null,
    seat: (row.seat as string | null) ?? undefined,
    securityCode: (row.security_code as string | null) ?? undefined,
    method: row.method as EventCheckin['method'],
    checkedInAt: row.checked_in_at as string,
  };
}

export async function createCheckinForMember(
  db: SupabaseClient,
  params: {
    eventId: string;
    profileId: string;
    memberId: string;
    churchId: string;
    campusId: string;
    selectedDependants: { name: string; surname: string; age: number | null }[];
    method?: 'self' | 'kiosk' | 'scanner' | 'staff';
  },
): Promise<{ primary: EventCheckin; dependants: EventCheckin[]; securityCode: string }> {
  const method = params.method ?? 'self';

  const { data: event, error: eventError } = await db
    .from('events')
    .select('id, church_id')
    .eq('id', params.eventId)
    .eq('church_id', params.churchId)
    .maybeSingle();

  if (eventError) throw eventError;
  if (!event) throw new Error('Event not found');

  const { data: existing, error: existingError } = await db
    .from('event_checkins')
    .select('*')
    .eq('event_id', params.eventId)
    .eq('member_id', params.memberId)
    .eq('is_dependant', false)
    .maybeSingle();

  if (existingError) throw existingError;

  let primaryRow: Record<string, unknown>;
  let securityCode: string;

  if (existing) {
    securityCode = String(existing.security_code ?? '');
    const { error: deleteError } = await db
      .from('event_checkins')
      .delete()
      .eq('event_id', params.eventId)
      .eq('guardian_member_id', params.memberId)
      .eq('is_dependant', true);
    if (deleteError) throw deleteError;
    primaryRow = existing;
  } else {
    securityCode = fourDigitCode();
    const { data: inserted, error: insertError } = await db
      .from('event_checkins')
      .insert({
        event_id: params.eventId,
        campus_id: params.campusId,
        profile_id: params.profileId,
        member_id: params.memberId,
        is_dependant: false,
        security_code: securityCode,
        method,
      })
      .select('*')
      .single();
    if (insertError) throw insertError;
    primaryRow = inserted;
  }

  const dependants: EventCheckin[] = [];
  for (const child of params.selectedDependants) {
    const dependantName = `${child.name} ${child.surname}`.trim();
    if (!dependantName) continue;
    const room = child.age == null ? null : roomForChildAge(child.age);
    const { data: childRow, error: childError } = await db
      .from('event_checkins')
      .insert({
        event_id: params.eventId,
        campus_id: params.campusId,
        is_dependant: true,
        dependant_name: dependantName,
        guardian_member_id: params.memberId,
        room,
        security_code: securityCode,
        method,
      })
      .select('*')
      .single();
    if (childError) throw childError;
    dependants.push(mapRow(childRow));
  }

  return {
    primary: mapRow(primaryRow),
    dependants,
    securityCode,
  };
}
