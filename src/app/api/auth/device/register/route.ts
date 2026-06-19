import { NextResponse } from 'next/server';
import { registerTrustedDevice } from '@/lib/auth/device-trust-server';
import { normalizePhone } from '@/lib/auth/session';
import { normalizeEmail } from '@/lib/auth/super-admin';

export async function POST(request: Request) {
  const body = await request.json();
  const phone = body.phone ? normalizePhone(body.phone) : undefined;
  const email = body.email ? normalizeEmail(body.email) : undefined;

  if ((!phone || phone.length < 9) && !email) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const result = await registerTrustedDevice({
    phone,
    email,
    userAgent: request.headers.get('user-agent'),
  });

  if (!result) {
    return NextResponse.json({ error: 'Could not register device' }, { status: 503 });
  }

  return NextResponse.json(result);
}
