import { NextResponse } from 'next/server';
import { checkOtp } from '@/lib/auth/otp-server';
import { normalizePhone } from '@/lib/auth/session';

export async function POST(request: Request) {
  const body = await request.json();
  const phone = normalizePhone(body.phone ?? '');
  const code = String(body.code ?? '').trim();

  if (phone.length < 9 || code.length !== 6) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!checkOtp(phone, code)) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
