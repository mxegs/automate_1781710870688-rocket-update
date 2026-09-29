import { NextResponse } from 'next/server';
import { churchIdForSessionEmail, notFoundResponse } from '@/lib/auth/session-church';
import { churchIdFromSlugQuery } from '@/lib/church/lookup-server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

async function claimedChurchId(request: Request): Promise<string | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;
  const sessionChurchId = await churchIdForSessionEmail(request);
  if (sessionChurchId) return sessionChurchId;
  return churchIdFromSlugQuery(db, request.url);
}

async function rsvpForCode(code: string) {
  const db = getSupabaseAdmin();
  if (!db) return { db: null, rsvp: null as Record<string, unknown> | null, error: null as string | null };
  const { data: rsvp, error } = await db
    .from('event_rsvps')
    .select('*, events(id, title, starts_at, church_id)')
    .eq('ticket_code', code)
    .maybeSingle();
  return { db, rsvp: rsvp as Record<string, unknown> | null, error: error?.message ?? null };
}

function eventChurchId(rsvp: Record<string, unknown> | null): string | null {
  const event = rsvp?.events as { church_id?: string } | { church_id?: string }[] | null | undefined;
  if (!event) return (rsvp?.church_id as string | undefined) ?? null;
  if (Array.isArray(event)) return event[0]?.church_id ?? null;
  return event.church_id ?? (rsvp?.church_id as string | undefined) ?? null;
}

export async function GET(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const churchId = await claimedChurchId(request);
  if (!churchId) return notFoundResponse();

  const code = new URL(request.url).searchParams.get('code')?.trim().toUpperCase();
  if (!code) return NextResponse.json({ error: 'Ticket code required' }, { status: 400 });

  const loaded = await rsvpForCode(code);
  if (loaded.error) return NextResponse.json({ error: loaded.error }, { status: 500 });
  const rsvp = loaded.rsvp;
  if (!rsvp || eventChurchId(rsvp) !== churchId) return notFoundResponse();

  if (rsvp.payment_status === 'pending') {
    return NextResponse.json({ valid: false, reason: 'Payment pending' });
  }

  const event = rsvp.events as { id: string; title: string; starts_at: string };
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
      id: event.id,
      title: event.title,
      startsAt: event.starts_at,
    },
  });
}

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const churchId = await claimedChurchId(request);
  if (!churchId) return notFoundResponse();

  const { code } = await request.json();
  if (!code) return NextResponse.json({ error: 'Ticket code required' }, { status: 400 });

  const loaded = await rsvpForCode(String(code).trim().toUpperCase());
  if (loaded.error) return NextResponse.json({ error: loaded.error }, { status: 500 });
  const rsvp = loaded.rsvp;
  if (!rsvp || eventChurchId(rsvp) !== churchId) return notFoundResponse();
  if (rsvp.payment_status === 'pending') {
    return NextResponse.json({ valid: false, reason: 'Payment pending' });
  }

  await db
    .from('event_rsvps')
    .update({ ticket_scanned_at: new Date().toISOString() })
    .eq('id', rsvp.id)
    .eq('church_id', churchId);

  return NextResponse.json({ valid: true, scanned: true, name: rsvp.name });
}
