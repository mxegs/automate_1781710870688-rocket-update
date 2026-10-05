import { NextResponse } from 'next/server';
import { normalizeEmail } from '@/lib/auth/super-admin';
import { normalizePhone } from '@/lib/auth/session';
import { churchIdFromUrl } from '@/lib/church/tenant';
import { notFoundResponse, requireSessionChurch, requireSessionChurchId } from '@/lib/auth/session-church';
import { canUsePastoralStaffTools, resolveStaffActor } from '@/lib/auth/staff-access-server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const VISITOR_SELECT =
  'id, name, surname, email, phone, campus_id, church_id, source, notes, first_visit_at, created_at, gender, marital_status, accepted_jesus, wants_to_join_church, event_news_consent';

async function sessionChurchOr404(
  request: Request,
): Promise<{ churchId: string } | { error: NextResponse }> {
  const requested = churchIdFromUrl(request.url);
  if (requested) {
    const denied = await requireSessionChurch(request, requested);
    if (denied) return { error: denied };
    return { churchId: requested };
  }
  const churchId = await requireSessionChurchId(request);
  if (churchId instanceof NextResponse) return { error: churchId };
  return { churchId };
}

export async function GET(request: Request) {
  const actor = await resolveStaffActor(request);
  if (!actor || !canUsePastoralStaffTools(actor)) return notFoundResponse();

  const scoped = await sessionChurchOr404(request);
  if ('error' in scoped) return scoped.error;

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const sinceDays = Number(new URL(request.url).searchParams.get('sinceDays') ?? '');
  let query = db
    .from('visitors')
    .select(VISITOR_SELECT)
    .eq('church_id', scoped.churchId)
    .order('created_at', { ascending: false });

  if (Number.isInteger(sinceDays) && sinceDays > 0) {
    query = query.gte('created_at', new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString());
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const actor = await resolveStaffActor(request);
  if (!actor || !canUsePastoralStaffTools(actor)) return notFoundResponse();

  const scoped = await sessionChurchOr404(request);
  if ('error' in scoped) return scoped.error;

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? '').trim();
  const email = normalizeEmail(String(body.email ?? ''));
  const phoneRaw = String(body.phone ?? '').trim();
  const phone = phoneRaw ? normalizePhone(phoneRaw) : '';
  const source = String(body.source ?? '').trim() || 'Walk-in';
  const notes = String(body.notes ?? '').trim() || null;
  const firstVisitAt = String(body.firstVisitAt ?? '').trim();
  const campusId = String(body.campusId ?? actor.campusId ?? 'midrand').trim() || 'midrand';

  if (!name) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
  }

  const parts = name.split(/\s+/);
  const surname = parts.length > 1 ? parts.slice(1).join(' ') : null;

  const payload = {
    name,
    surname,
    email: email.includes('@') ? email : null,
    phone: phone.length >= 9 ? phone : phoneRaw || null,
    campus_id: campusId,
    church_id: scoped.churchId,
    source,
    notes,
    first_visit_at: firstVisitAt ? new Date(firstVisitAt).toISOString() : new Date().toISOString(),
  };

  const { data, error } = await db.from('visitors').insert(payload).select(VISITOR_SELECT).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
