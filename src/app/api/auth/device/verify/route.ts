import { NextResponse } from 'next/server';
import { verifyTrustedDevice } from '@/lib/auth/device-trust-server';
import { normalizePhone } from '@/lib/auth/session';
import { normalizeEmail } from '@/lib/auth/super-admin';

export async function POST(request: Request) {
  const body = await request.json();
  const phone = body.phone ? normalizePhone(body.phone) : undefined;
  const email = body.email ? normalizeEmail(body.email) : undefined;
  const token = String(body.token ?? '').trim();

  if (!token || ((!phone || phone.length < 9) && !email)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const ok = await verifyTrustedDevice({ phone, email, token });
  if (!ok) {
    return NextResponse.json({ error: 'Device not trusted' }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
