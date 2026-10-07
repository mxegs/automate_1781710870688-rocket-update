import { getCampusLabel } from '@/lib/church/constants';
import { initialsFromFullName } from '@/lib/members/photo';
import type { MembershipApplication } from '@/lib/membership/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export const MARITAL_STATUSES = [
  'Never Married',
  'Married',
  'Divorced',
  'Engaged',
  'Widow or Widower',
] as const;

export type MaritalStatus = (typeof MARITAL_STATUSES)[number];

export function digits(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '');
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function showMarriageDate(maritalStatus: string): boolean {
  return maritalStatus === 'Married' || maritalStatus === 'Engaged';
}

export async function loadOwnProfilePayload(
  db: SupabaseClient,
  opts: { email: string; churchId: string; profile: Record<string, unknown>; member: Record<string, unknown> },
) {
  const { email, churchId, profile, member: row } = opts;
  const phone = String(row.phone ?? profile.phone ?? '');
  const phoneDigits = digits(phone);
  const suffix = phoneDigits.slice(-9);
  const profileId = String(profile.id);

  const { data: church } = await db.from('churches').select('id, name').eq('id', churchId).maybeSingle();

  const campusId = String(row.campus_id ?? profile.campus_id ?? '');
  const photoUrl = typeof row.photo_url === 'string' && row.photo_url ? row.photo_url : null;
  const photoVisible = row.photo_visible !== false;
  const marriageDate =
    (typeof row.marriage_date === 'string' && row.marriage_date) ||
    (typeof row.anniversary_date === 'string' && row.anniversary_date) ||
    null;
  const fullName = String(row.full_name ?? profile.official_name ?? profile.display_name ?? '');

  let application: MembershipApplication | null = null;
  if (typeof row.application_id === 'string' && row.application_id) {
    const { data: app } = await db
      .from('membership_applications')
      .select('application_data')
      .eq('id', row.application_id)
      .eq('church_id', churchId)
      .maybeSingle();
    if (app?.application_data) application = app.application_data as MembershipApplication;
  }

  const personal = application?.personal;
  const emergency = application?.emergencyContact;
  const occupationList = personal?.occupation?.filter(Boolean) ?? [];
  const occupation =
    occupationList.join(', ') + (personal?.occupationOther ? ` · ${personal.occupationOther}` : '');

  let groupQuery = db.from('group_members').select('group_id, member_phone, profile_id');
  if (suffix.length >= 9) {
    groupQuery = groupQuery.or(
      `profile_id.eq.${profileId},member_phone.eq.${phone},member_phone.like.%${suffix}`,
    );
  } else {
    groupQuery = groupQuery.or(`profile_id.eq.${profileId},member_phone.eq.${phone}`);
  }
  const { data: memberships } = await groupQuery;
  const groupIds = [...new Set((memberships ?? []).map((m: { group_id: string }) => m.group_id))];

  let groups: { id: string; name: string }[] = [];
  if (groupIds.length) {
    const { data: groupRows } = await db
      .from('groups')
      .select('id, name, church_id')
      .in('id', groupIds)
      .eq('church_id', churchId);
    groups = (groupRows ?? []).map((g: { id: string; name: string }) => ({ id: g.id, name: g.name }));
  }

  const nowIso = new Date().toISOString();
  let rsvpQuery = db
    .from('event_rsvps')
    .select('id, event_id, status, profile_id, phone, church_id')
    .eq('church_id', churchId)
    .neq('status', 'declined');
  if (suffix.length >= 9) {
    rsvpQuery = rsvpQuery.or(`profile_id.eq.${profileId},phone.eq.${phone},phone.like.%${suffix}`);
  } else {
    rsvpQuery = rsvpQuery.or(`profile_id.eq.${profileId},phone.eq.${phone}`);
  }
  const { data: rsvps } = await rsvpQuery;
  const eventIds = [...new Set((rsvps ?? []).map((r: { event_id: string }) => r.event_id))];

  let upcomingEvents: { id: string; title: string; startsAt: string }[] = [];
  if (eventIds.length) {
    const { data: eventRows } = await db
      .from('events')
      .select('id, title, starts_at, church_id')
      .in('id', eventIds)
      .eq('church_id', churchId)
      .gte('starts_at', nowIso)
      .order('starts_at', { ascending: true });
    upcomingEvents = (eventRows ?? []).map((ev: { id: string; title: string; starts_at: string }) => ({
      id: ev.id,
      title: ev.title,
      startsAt: ev.starts_at,
    }));
  }

  const { data: byProfile } = await db
    .from('prayer_requests')
    .select('id, title, status, created_at')
    .eq('church_id', churchId)
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: byEmail } = await db
    .from('prayer_requests')
    .select('id, title, status, created_at')
    .eq('church_id', churchId)
    .ilike('contact_email', email)
    .order('created_at', { ascending: false })
    .limit(5);

  const prayerMap = new Map<string, { id: string; title: string; status: string; createdAt: string }>();
  for (const p of [...(byProfile ?? []), ...(byEmail ?? [])] as {
    id: string;
    title: string;
    status: string;
    created_at: string;
  }[]) {
    prayerMap.set(p.id, { id: p.id, title: p.title, status: p.status, createdAt: p.created_at });
  }
  const prayerRequests = [...prayerMap.values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return {
    memberId: row.id,
    profileId,
    churchId,
    churchName: (church as { name?: string } | null)?.name ?? '',
    campusId,
    campusName: campusId ? getCampusLabel(campusId) : '',
    fullName,
    initials: initialsFromFullName(fullName),
    photoUrl,
    photoVisible,
    memberSince: (row.member_since as string | null) ?? null,
    phone,
    email: (row.email as string | null) ?? (profile.email as string | null),
    pendingEmail: (typeof row.pending_email === 'string' && row.pending_email) || null,
    dateOfBirth: (row.date_of_birth as string | null) ?? null,
    identityNumber: personal?.identityNumber || null,
    status: (row.status as string | null) ?? null,
    role: (profile.role as string | null) ?? null,
    maritalStatus: (row.marital_status as string | null) || personal?.maritalStatus || null,
    marriageDate,
    address: personal?.permanentAddress || '',
    occupation: occupation.trim(),
    emergencyContactName: emergency?.name || '',
    emergencyContactRelationship: emergency?.relationship || '',
    emergencyContactPhone: emergency?.phoneNumber || '',
    groups,
    upcomingEvents,
    prayerRequests,
  };
}
