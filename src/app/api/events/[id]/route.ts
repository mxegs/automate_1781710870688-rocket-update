import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { deriveEventStatus, formatEventDateTime } from '@/lib/events/utils';
import type { ChurchEvent } from '@/lib/events/types';
import type { ContentVisibility } from '@/lib/sermons/types';

function mapEventRow(row: Record<string, unknown>, rsvpCount = 0): ChurchEvent {
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
  const updates: Record<string, unknown> = {};

  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.description !== undefined) updates.description = body.description?.trim() || null;
  if (body.campus !== undefined) updates.campus_id = body.campus;
  if (body.visibility !== undefined) updates.visibility = body.visibility;
  if (body.category !== undefined) updates.category = body.category;
  if (body.location !== undefined) updates.location = body.location?.trim() || null;
  if (body.startsAt !== undefined) updates.starts_at = body.startsAt;
  if (body.endsAt !== undefined) updates.ends_at = body.endsAt || null;
  if (body.imageUrl !== undefined) updates.image_url = body.imageUrl?.trim() || null;
  if (body.capacity !== undefined) updates.capacity = body.capacity;
  if (body.isPaid !== undefined) updates.is_paid = Boolean(body.isPaid);
  if (body.priceCents !== undefined) updates.price_cents = body.priceCents;
  if (body.yocoPaymentLink !== undefined) updates.yoco_payment_link = body.yocoPaymentLink?.trim() || null;
  if (body.reminderHoursBefore !== undefined) updates.reminder_hours_before = body.reminderHoursBefore;

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
