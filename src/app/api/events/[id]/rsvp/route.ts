import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { generateTicketCode } from '@/lib/events/utils';
import { buildYocoPaymentUrl } from '@/lib/payments/yoco';
import type { EventRsvp } from '@/lib/events/types';

function mapRsvp(row: Record<string, unknown>): EventRsvp {
  return {
    id: row.id as string,
    eventId: row.event_id as string,
    name: row.name as string,
    phone: (row.phone as string) ?? undefined,
    email: (row.email as string) ?? undefined,
    status: row.status as EventRsvp['status'],
    isVisitor: Boolean(row.is_visitor),
    guestsCount: (row.guests_count as number) ?? 1,
    paymentStatus: (row.payment_status as EventRsvp['paymentStatus']) ?? 'free',
    ticketCode: (row.ticket_code as string) ?? undefined,
    rsvpAt: row.rsvp_at as string,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const { id } = await params;
  const { data, error } = await db
    .from('event_rsvps')
    .select('*')
    .eq('event_id', id)
    .order('rsvp_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(mapRsvp));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const { id: eventId } = await params;
  const body = await request.json();

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  if (!body.phone?.trim() && !body.email?.trim()) {
    return NextResponse.json({ error: 'Phone or email is required' }, { status: 400 });
  }

  const { data: event, error: eventErr } = await db
    .from('events')
    .select('*')
    .eq('id', eventId)
    .maybeSingle();

  if (eventErr) return NextResponse.json({ error: eventErr.message }, { status: 500 });
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  const phoneNorm = body.phone?.replace(/\D/g, '') ?? '';
  const emailNorm = body.email?.trim().toLowerCase() ?? '';

  if (phoneNorm || emailNorm) {
    const { data: existingRsvps } = await db
      .from('event_rsvps')
      .select('id, phone, email')
      .eq('event_id', eventId);

    const duplicate = (existingRsvps ?? []).some((row) => {
      const rowPhone = row.phone?.replace(/\D/g, '') ?? '';
      const rowEmail = row.email?.trim().toLowerCase() ?? '';
      if (phoneNorm && rowPhone && phoneNorm === rowPhone) return true;
      if (emailNorm && rowEmail && emailNorm === rowEmail) return true;
      return false;
    });

    if (duplicate) {
      return NextResponse.json({ error: 'You are already registered for this event.' }, { status: 409 });
    }
  }

  const isPaid = Boolean(event.is_paid);
  const ticketCode = generateTicketCode(eventId);
  const paymentStatus = isPaid ? 'pending' : 'free';

  let visitorId: string | null = body.visitorId ?? null;
  if (!visitorId && body.isVisitor) {
    const { data: visitor } = await db
      .from('visitors')
      .insert({
        name: body.name.trim(),
        phone: body.phone?.trim() || null,
        email: body.email?.trim() || null,
        campus_id: event.campus_id,
        source: 'event_rsvp',
      })
      .select('id')
      .single();
    visitorId = visitor?.id ?? null;
  }

  const { data: rsvp, error } = await db
    .from('event_rsvps')
    .insert({
      event_id: eventId,
      visitor_id: visitorId,
      profile_id: body.profileId || null,
      name: body.name.trim(),
      phone: body.phone?.trim() || null,
      email: body.email?.trim() || null,
      status: 'going',
      is_visitor: Boolean(body.isVisitor),
      guests_count: body.guestsCount ?? 1,
      payment_status: paymentStatus,
      ticket_code: isPaid ? null : ticketCode,
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let paymentUrl: string | undefined;
  if (isPaid && event.price_cents) {
    paymentUrl = buildYocoPaymentUrl({
      eventId,
      rsvpId: rsvp.id,
      amountCents: event.price_cents,
      currency: event.currency ?? 'ZAR',
      description: event.title,
      existingLink: event.yoco_payment_link,
    });
  }

  return NextResponse.json({
    rsvp: mapRsvp(rsvp),
    paymentUrl,
    ticketCode: isPaid ? undefined : ticketCode,
  });
}
