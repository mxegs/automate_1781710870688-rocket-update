import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { deriveEventStatus, filterEventsFeed, formatEventDateTime } from '@/lib/events/utils';
import type { ChurchEvent } from '@/lib/events/types';
import type { ContentVisibility } from '@/lib/sermons/types';

function mapEventRow(
  row: Record<string, unknown>,
  rsvpCount = 0,
): ChurchEvent {
  const startsAt = row.starts_at as string;
  const endsAt = row.ends_at as string | null;
  const { date, time } = formatEventDateTime(startsAt);
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? '',
    campus: row.campus_id as ChurchEvent['campus'],
    visibility: row.visibility as ContentVisibility,
    category: (row.category as string) ?? 'General',
    location: (row.location as string) ?? '',
    startsAt,
    endsAt: endsAt ?? undefined,
    date,
    time,
    imageUrl: (row.image_url as string) ?? undefined,
    capacity: (row.capacity as number) ?? undefined,
    rsvpCount,
    isPaid: Boolean(row.is_paid),
    priceCents: (row.price_cents as number) ?? undefined,
    currency: (row.currency as string) ?? 'ZAR',
    yocoPaymentLink: (row.yoco_payment_link as string) ?? undefined,
    reminderHoursBefore: (row.reminder_hours_before as number) ?? 24,
    status: deriveEventStatus(startsAt, endsAt ?? undefined),
  };
}

export async function GET(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const forAdmin = searchParams.get('forAdmin') === 'true';
  const campusId = searchParams.get('campusId');
  const allCampuses = searchParams.get('allCampuses') === 'true';
  const memberCampus = searchParams.get('memberCampus');
  const isVisitor = searchParams.get('isVisitor') === 'true';

  const { data: events, error } = await db
    .from('events')
    .select('*')
    .order('starts_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const eventIds = (events ?? []).map((e) => e.id);
  const rsvpCounts: Record<string, number> = {};

  if (eventIds.length > 0) {
    const { data: rsvps } = await db
      .from('event_rsvps')
      .select('event_id')
      .in('event_id', eventIds)
      .eq('status', 'going');
    for (const r of rsvps ?? []) {
      rsvpCounts[r.event_id] = (rsvpCounts[r.event_id] ?? 0) + 1;
    }
  }

  let items = (events ?? []).map((e) => mapEventRow(e, rsvpCounts[e.id] ?? 0));

  if (forAdmin) {
    if (!allCampuses && campusId) {
      items = items.filter((e) => e.campus === campusId || e.visibility === 'church_wide');
    }
  } else {
    items = filterEventsFeed(items, memberCampus, isVisitor);
    items = items.filter((e) => e.status !== 'completed');
  }

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const body = await request.json();
  if (!body.title?.trim() || !body.startsAt || !body.campus) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data, error } = await db
    .from('events')
    .insert({
      title: body.title.trim(),
      description: body.description?.trim() || null,
      campus_id: body.campus,
      visibility: body.visibility ?? 'campus_only',
      category: body.category ?? 'General',
      location: body.location?.trim() || null,
      starts_at: body.startsAt,
      ends_at: body.endsAt || null,
      image_url: body.imageUrl?.trim() || null,
      capacity: body.capacity ?? null,
      is_paid: Boolean(body.isPaid),
      price_cents: body.isPaid ? body.priceCents ?? null : null,
      yoco_payment_link: body.yocoPaymentLink?.trim() || null,
      reminder_hours_before: body.reminderHoursBefore ?? 24,
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapEventRow(data, 0));
}
