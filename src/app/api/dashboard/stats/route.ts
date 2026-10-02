import { NextResponse } from 'next/server';
import { shouldHideFromMemberDirectory } from '@/lib/auth/super-admin';
import { churchIdFromUrl } from '@/lib/church/tenant';
import { notFoundResponse, requireSessionChurch, requireSessionChurchId } from '@/lib/auth/session-church';
import { resolveStaffActor } from '@/lib/auth/staff-access-server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const actor = await resolveStaffActor(request);
  if (!actor) return notFoundResponse();

  const requested = churchIdFromUrl(request.url);
  if (requested) {
    const denied = await requireSessionChurch(request, requested);
    if (denied) return denied;
  }

  const churchId = requested ?? (await requireSessionChurchId(request));
  if (churchId instanceof NextResponse) return churchId;

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  const [membersRes, visitorsRes, prayersRes, eventsRes] = await Promise.all([
    db.from('members').select('email, phone').eq('church_id', churchId).eq('status', 'active'),
    db
      .from('visitors')
      .select('id', { count: 'exact', head: true })
      .eq('church_id', churchId)
      .gte('created_at', weekAgo),
    db
      .from('prayer_requests')
      .select('id', { count: 'exact', head: true })
      .eq('church_id', churchId)
      .neq('status', 'answered'),
    db
      .from('events')
      .select('id, title, starts_at')
      .eq('church_id', churchId)
      .gte('starts_at', now)
      .order('starts_at', { ascending: true }),
  ]);

  if (membersRes.error) return NextResponse.json({ error: membersRes.error.message }, { status: 500 });
  if (visitorsRes.error) return NextResponse.json({ error: visitorsRes.error.message }, { status: 500 });
  if (prayersRes.error) return NextResponse.json({ error: prayersRes.error.message }, { status: 500 });
  if (eventsRes.error) return NextResponse.json({ error: eventsRes.error.message }, { status: 500 });

  const members = (membersRes.data ?? []).filter(
    (row) => !shouldHideFromMemberDirectory({ email: row.email, phone: row.phone }),
  ).length;

  const upcoming = eventsRes.data ?? [];

  return NextResponse.json({
    churchId,
    members,
    visitorsThisWeek: visitorsRes.count ?? 0,
    openPrayers: prayersRes.count ?? 0,
    upcomingEvents: upcoming.length,
    nextEventTitle: upcoming[0]?.title ?? null,
  });
}
