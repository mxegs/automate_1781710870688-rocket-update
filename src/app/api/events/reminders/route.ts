import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { generateTicketCode } from '@/lib/events/utils';
import { sendSms } from '@/lib/sms/service';

export async function POST() {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const now = new Date();
  const { data: events, error } = await db
    .from('events')
    .select('*')
    .is('reminder_sent_at', null)
    .gte('starts_at', now.toISOString());

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sent = 0;
  for (const event of events ?? []) {
    const hoursBefore = event.reminder_hours_before ?? 24;
    const eventStart = new Date(event.starts_at).getTime();
    const reminderWindow = eventStart - hoursBefore * 60 * 60 * 1000;

    if (now.getTime() < reminderWindow) continue;

    const { data: rsvps } = await db
      .from('event_rsvps')
      .select('*')
      .eq('event_id', event.id)
      .eq('status', 'going')
      .is('reminder_sent_at', null);

    for (const rsvp of rsvps ?? []) {
      if (!rsvp.phone) continue;
      const message = `Reminder: ${event.title} is coming up on ${new Date(event.starts_at).toLocaleString('en-ZA')}. We look forward to seeing you! — CKC`;
      await sendSms(rsvp.phone, message);
      await db
        .from('event_rsvps')
        .update({ reminder_sent_at: now.toISOString() })
        .eq('id', rsvp.id);
      sent++;
    }

    await db
      .from('events')
      .update({ reminder_sent_at: now.toISOString() })
      .eq('id', event.id);
  }

  return NextResponse.json({ sent });
}
