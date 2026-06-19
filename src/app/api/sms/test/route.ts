import { NextResponse } from 'next/server';
import { getBulkSmsAuthHeader } from '@/lib/sms/bulksms-auth';

/** GET /api/sms/test — verify BulkSMS credentials (staff use only) */
export async function GET() {
  const auth = getBulkSmsAuthHeader();
  if (!auth) {
    return NextResponse.json({ ok: false, error: 'BulkSMS credentials not in .env' }, { status: 503 });
  }

  const res = await fetch('https://api.bulksms.com/v1/profile', {
    headers: { Accept: 'application/json', Authorization: auth },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      { ok: false, error: (data as { detail?: string })?.detail ?? res.statusText },
      { status: res.status },
    );
  }

  return NextResponse.json({
    ok: true,
    provider: 'bulksms',
    credits: (data as { credits?: { balance?: number } })?.credits?.balance,
  });
}
