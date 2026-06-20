import { NextResponse } from 'next/server';
import { canSendBroadcast } from '@/lib/broadcast/access-server';
import { resolveStaffActor } from '@/lib/auth/staff-access-server';
import { testMailchimpConnection } from '@/lib/email/mailchimp';

export async function GET(request: Request) {
  const actor = await resolveStaffActor(request);
  if (!actor) {
    return NextResponse.json({ ok: false, error: 'Staff sign-in required' }, { status: 401 });
  }
  if (!canSendBroadcast(actor)) {
    return NextResponse.json({ ok: false, error: 'Not available for app developer accounts' }, { status: 403 });
  }

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
