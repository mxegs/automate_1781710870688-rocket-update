import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { sendSms } from '@/lib/sms/service';
import { formatPhoneDisplay } from '@/lib/auth/session';

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const body = await request.json();
  const { contactIds, channel, message } = body;

  if (!contactIds?.length || !message?.trim()) {
    return NextResponse.json({ error: 'Contacts and message required' }, { status: 400 });
  }

  const { data: contacts, error } = await db
    .from('follow_ups')
    .select('*')
    .in('id', contactIds);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sent = 0;
  for (const contact of contacts ?? []) {
    if (channel === 'sms' || channel === 'whatsapp') {
      await sendSms(
        contact.phone,
        channel === 'whatsapp'
          ? `[WhatsApp] ${message}`
          : message,
      );
      sent++;
    } else if (channel === 'newsletter') {
      console.info('[Newsletter]', contact.name, formatPhoneDisplay(contact.phone), message);
      sent++;
    }
    await db
      .from('follow_ups')
      .update({ last_contact_at: new Date().toISOString() })
      .eq('id', contact.id);
  }

  return NextResponse.json({ sent, channel });
}
