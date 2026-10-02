import { NextResponse } from 'next/server';
import { canSendBroadcast } from '@/lib/broadcast/access-server';
import { notFoundResponse } from '@/lib/auth/session-church';
import { resolveStaffActor } from '@/lib/auth/staff-access-server';
import { testMailchimpConnection } from '@/lib/email/mailchimp';

export async function GET(request: Request) {
  const actor = await resolveStaffActor(request);
  if (!actor || !canSendBroadcast(actor)) return notFoundResponse();

  const result = await testMailchimpConnection();
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 503 });
  }
  return NextResponse.json({
    ok: true,
    listName: result.listName,
    fromEmail: result.fromEmail,
    doubleOptIn: result.doubleOptIn,
    warning: result.warning,
  });
}
