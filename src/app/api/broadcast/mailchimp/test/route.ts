import { NextResponse } from 'next/server';
import { testMailchimpConnection } from '@/lib/email/mailchimp';

export async function GET() {
  const result = await testMailchimpConnection();
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 503 });
  }
  return NextResponse.json({ ok: true, listName: result.listName, fromEmail: result.fromEmail });
}
