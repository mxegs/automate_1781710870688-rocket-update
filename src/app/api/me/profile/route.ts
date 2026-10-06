import { NextResponse } from 'next/server';
import { churchIdFromUrl } from '@/lib/church/tenant';
import { getCampusLabel } from '@/lib/church/constants';
import { churchIdForSessionEmail, notFoundResponse, requireSessionChurch } from '@/lib/auth/session-church';
import { readSessionEmailHeader } from '@/lib/auth/staff-access-server';
import { initialsFromFullName } from '@/lib/members/photo';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

function digits(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '');
}

export async function GET(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const email = readSessionEmailHeader(request);
  if (!email.includes('@')) return notFoundResponse();

  const requested = churchIdFromUrl(request.url);
  if (requested) {
    const denied = await requireSessionChurch(request, requested);
    if (denied) return denied;
  }

  const churchId = requested ?? (await churchIdForSessionEmail(request));
  if (!churchId) return notFoundResponse();

  const { data: profiles, error: profileError } = await db
    .from('profiles')
    .select('id, email, phone, photo_url, church_id, campus_id, official_name, display_name')
    .ilike('email', email)
    .eq('church_id', churchId)
    .limit(2);

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });
  if (!profiles?.length || profiles.length > 1) return notFoundResponse();

  const profile = profiles[0] as {
    id: string;
    email: string | null;
    phone: string | null;
    photo_url: string | null;
    church_id: string | null;
    campus_id: string | null;
    official_name: string | null;
    display_name: string | null;
  };

  const { data: member, error: memberError } = await db
    .from('members')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('church_id', churchId)
    .maybeSingle();

  if (memberError) return NextResponse.json({ error: memberError.message }, { status: 500 });
  if (!member) return notFoundResponse();

  const row = member as Record<string, unknown>;
  const phone = String(row.phone ?? profile.phone ?? '');
  const phoneDigits = digits(phone);
  const suffix = phoneDigits.slice(-9);

  const { data: church } = await db.from('churches').select('id, name').eq('id', churchId).maybeSingle();

  const campusId = String(row.campus_id ?? profile.campus_id ?? '');
  const photoUrl = typeof row.photo_url === 'string' && row.photo_url ? row.photo_url : null;
  const photoVisible = row.photo_visible !== false;
  const marriageDate =
    (typeof row.marriage_date === 'string' && row.marriage_date) ||
    (typeof row.anniversary_date === 'string' && row.anniversary_date) ||
    null;

  const fullName = String(row.full_name ?? profile.official_name ?? profile.display_name ?? '');

  let groupQuery = db.from('group_members').select('group_id, member_phone, profile_id');
  if (suffix.length >= 9) {
    groupQuery = groupQuery.or(
      `profile_id.eq.${profile.id},member_phone.eq.${phone},member_phone.like.%${suffix}`,
    );
  } else {
    groupQuery = groupQuery.or(`profile_id.eq.${profile.id},member_phone.eq.${phone}`);
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
    rsvpQuery = rsvpQuery.or(`profile_id.eq.${profile.id},phone.eq.${phone},phone.like.%${suffix}`);
  } else {
    rsvpQuery = rsvpQuery.or(`profile_id.eq.${profile.id},phone.eq.${phone}`);
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
    .eq('profile_id', profile.id)
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

  return NextResponse.json({
    memberId: row.id,
    profileId: profile.id,
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
    email: (row.email as string | null) ?? profile.email,
    dateOfBirth: (row.date_of_birth as string | null) ?? null,
    status: (row.status as string | null) ?? null,
    marriageDate,
    groups,
    upcomingEvents,
    prayerRequests,
  });
}
