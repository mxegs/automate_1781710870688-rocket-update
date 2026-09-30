import { NextResponse } from 'next/server';
import { formatPhoneDisplay } from '@/lib/auth/session';
import { notFoundResponse, requireSessionChurchId } from '@/lib/auth/session-church';
import { canUsePastoralStaffTools, resolveStaffActor } from '@/lib/auth/staff-access-server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { sendSms } from '@/lib/sms/service';
import { isInternalPlaceholderPhone } from '@/lib/auth/super-admin';

export async function POST(request: Request) {
  const actor = await resolveStaffActor(request);
  if (!actor || !canUsePastoralStaffTools(actor)) return notFoundResponse();

  const churchId = await requireSessionChurchId(request);
  if (churchId instanceof NextResponse) return churchId;

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const body = await request.json();
  const { contactIds, channel, message } = body;

  if (!contactIds?.length || !message?.trim()) {
    return NextResponse.json({ error: 'Contacts and message required' }, { status: 400 });
  }

  const ids = (contactIds as unknown[]).filter((id): id is string => typeof id === 'string' && Boolean(id));
  const { data: contacts, error } = await db
    .from('follow_ups')
    .select('*')
    .in('id', ids)
    .eq('church_id', churchId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if ((contacts ?? []).length !== ids.length) return notFoundResponse();

  let sent = 0;
  let skipped = 0;
  for (const contact of contacts ?? []) {
    if ((channel === 'sms' || channel === 'whatsapp') && isInternalPlaceholderPhone(contact.phone)) {
      skipped++;
      continue;
    }
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
      .eq('id', contact.id)
      .eq('church_id', churchId);
  }

  return NextResponse.json({ sent, skipped, channel });
}
