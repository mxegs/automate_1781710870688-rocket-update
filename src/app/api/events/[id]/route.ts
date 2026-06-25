import { NextResponse } from 'next/server';
import { mapEventRow } from '@/lib/events/mappers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

function eventUpdatePayload(body: Record<string, unknown>): Record<string, unknown> {
  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = String(body.title).trim();
  if (body.description !== undefined) updates.description = String(body.description ?? '').trim() || null;
  if (body.eventInfo !== undefined) updates.event_info = String(body.eventInfo ?? '').trim() || null;
  if (body.campus !== undefined) updates.campus_id = body.campus;
  if (body.visibility !== undefined) updates.visibility = body.visibility;
  if (body.category !== undefined) updates.category = body.category;
  if (body.location !== undefined) updates.location = String(body.location ?? '').trim() || null;
  if (body.venueName !== undefined) updates.venue_name = String(body.venueName ?? '').trim() || null;
  if (body.venueAddress !== undefined) updates.venue_address = String(body.venueAddress ?? '').trim() || null;
  if (body.venueCity !== undefined) updates.venue_city = String(body.venueCity ?? '').trim() || null;
  if (body.venueDirectionsUrl !== undefined) {
    updates.venue_directions_url = String(body.venueDirectionsUrl ?? '').trim() || null;
  }
  if (body.importantInfo !== undefined) updates.important_info = String(body.importantInfo ?? '').trim() || null;
  if (body.startsAt !== undefined) updates.starts_at = body.startsAt;
  if (body.endsAt !== undefined) updates.ends_at = body.endsAt || null;
  if (body.imageUrl !== undefined) updates.image_url = String(body.imageUrl ?? '').trim() || null;
  if (body.capacity !== undefined) updates.capacity = body.capacity;
  if (body.isPaid !== undefined) updates.is_paid = Boolean(body.isPaid);
  if (body.priceCents !== undefined) updates.price_cents = body.priceCents;
  if (body.yocoPaymentLink !== undefined) {
    updates.yoco_payment_link = String(body.yocoPaymentLink ?? '').trim() || null;
  }
  if (body.reminderHoursBefore !== undefined) updates.reminder_hours_before = body.reminderHoursBefore;
  return updates;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const { id } = await params;
  const { data, error } = await db.from('events').select('*').eq('id', id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  const { count } = await db
    .from('event_rsvps')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', id)
    .eq('status', 'going');

  return NextResponse.json(mapEventRow(data, count ?? 0));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const { id } = await params;
  const body = await request.json();
  const updates = eventUpdatePayload(body);

  const { data, error } = await db.from('events').update(updates).eq('id', id).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapEventRow(data, 0));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const { id } = await params;
  const { error } = await db.from('events').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
