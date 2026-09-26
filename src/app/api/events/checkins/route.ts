import { NextResponse } from 'next/server';
import { churchIdForSessionEmail } from '@/lib/auth/session-church';
import { readSessionEmailHeader } from '@/lib/auth/staff-access-server';
import { dependantsForMember } from '@/lib/membership/dependants';
import { createCheckinForMember } from '@/lib/events/check-in';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

function notFound() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

function selectedDependantsFromBody(
  dependants: unknown,
): { name: string; surname: string; age: number | null }[] {
  if (!Array.isArray(dependants)) return [];
  return dependants.map((raw) => {
    const row = raw as { name?: string; surname?: string; age?: number | string | null };
    const surname = typeof row.surname === 'string' ? row.surname.trim() : '';
    if (surname || row.age != null) {
      const age =
        typeof row.age === 'number' && Number.isFinite(row.age)
          ? row.age
          : typeof row.age === 'string' && row.age.trim() !== '' && Number.isFinite(Number(row.age))
            ? Number(row.age)
            : null;
      return { name: String(row.name ?? '').trim(), surname, age };
    }
    const parts = String(row.name ?? '').trim().split(/\s+/).filter(Boolean);
    return { name: parts[0] ?? '', surname: parts.slice(1).join(' '), age: null };
  });
}

export async function POST(request: Request) {
  const churchId = await churchIdForSessionEmail(request);
  if (!churchId) return notFound();

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const body = await request.json();
  if (!body.eventId) return NextResponse.json({ error: 'eventId is required' }, { status: 400 });

  const { data: event } = await db
    .from('events')
    .select('id, campus_id, church_id, visibility')
    .eq('id', body.eventId)
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

  const { data: member } = await db
    .from('members')
    .select('id, campus_id')
    .eq('profile_id', profile.id)
    .eq('church_id', churchId)
    .maybeSingle();
  if (!member) return notFound();

  if (
    event.visibility === 'campus_only' &&
    event.campus_id &&
    member.campus_id &&
    event.campus_id !== member.campus_id
  ) {
    return notFound();
  }

  let selectedDependants = selectedDependantsFromBody(body.dependants);
  if (body.useHousehold === true) {
    selectedDependants = await dependantsForMember(db, member.id, churchId);
  }

  try {
    const result = await createCheckinForMember(db, {
      eventId: body.eventId,
      profileId: profile.id,
      memberId: member.id,
      churchId,
      campusId: event.campus_id,
      selectedDependants,
      method: body.method,
    });
    return NextResponse.json({
      primary: result.primary,
      dependants: result.dependants,
      securityCode: result.securityCode,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'Event not found') return notFound();
    const message = err instanceof Error ? err.message : 'Check-in failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
