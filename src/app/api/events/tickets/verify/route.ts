import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code')?.trim().toUpperCase();
  if (!code) return NextResponse.json({ error: 'Ticket code required' }, { status: 400 });

  const { data: rsvp, error } = await db
    .from('event_rsvps')
    .select('*, events(*)')
    .eq('ticket_code', code)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!rsvp) return NextResponse.json({ valid: false });

  if (rsvp.payment_status === 'pending') {
    return NextResponse.json({ valid: false, reason: 'Payment pending' });
  }

  return NextResponse.json({
    valid: true,
    alreadyScanned: Boolean(rsvp.ticket_scanned_at),
    rsvp: {
      id: rsvp.id,
      name: rsvp.name,
      guestsCount: rsvp.guests_count,
      ticketCode: rsvp.ticket_code,
    },
    event: {
      id: rsvp.events.id,
      title: rsvp.events.title,
      startsAt: rsvp.events.starts_at,
    },
  });
}

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const { code } = await request.json();
  if (!code) return NextResponse.json({ error: 'Ticket code required' }, { status: 400 });

  const { data: rsvp, error } = await db
    .from('event_rsvps')
    .select('*')
    .eq('ticket_code', code.trim().toUpperCase())
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!rsvp) return NextResponse.json({ valid: false });
  if (rsvp.payment_status === 'pending') {
    return NextResponse.json({ valid: false, reason: 'Payment pending' });
  }

  await db
    .from('event_rsvps')
    .update({ ticket_scanned_at: new Date().toISOString() })
    .eq('id', rsvp.id);

  return NextResponse.json({ valid: true, scanned: true, name: rsvp.name });
}
