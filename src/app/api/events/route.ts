import { NextResponse } from 'next/server';
import { mapEventRow } from '@/lib/events/mappers';
import { filterEventsFeed } from '@/lib/events/utils';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

function eventInsertPayload(body: Record<string, unknown>) {
  return {
    title: String(body.title ?? '').trim(),
    description: String(body.description ?? '').trim() || null,
    event_info: String(body.eventInfo ?? '').trim() || null,
    campus_id: body.campus,
    visibility: body.visibility ?? 'campus_only',
    category: body.category ?? 'General',
    location: String(body.location ?? '').trim() || null,
    venue_name: String(body.venueName ?? '').trim() || null,
    venue_address: String(body.venueAddress ?? '').trim() || null,
    venue_city: String(body.venueCity ?? '').trim() || null,
    venue_directions_url: String(body.venueDirectionsUrl ?? '').trim() || null,
    important_info: String(body.importantInfo ?? '').trim() || null,
    starts_at: body.startsAt,
    ends_at: body.endsAt || null,
    image_url: String(body.imageUrl ?? '').trim() || null,
    capacity: body.capacity ?? null,
    is_paid: Boolean(body.isPaid),
    price_cents: body.isPaid ? body.priceCents ?? null : null,
    yoco_payment_link: String(body.yocoPaymentLink ?? '').trim() || null,
    reminder_hours_before: body.reminderHoursBefore ?? 24,
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
    .insert(eventInsertPayload(body))
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapEventRow(data, 0));
}
