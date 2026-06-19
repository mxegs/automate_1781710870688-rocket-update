import { NextResponse } from 'next/server';
import { checkEmailOtp } from '@/lib/auth/email-otp-server';
import { isSuperAdminEmail, normalizeEmail } from '@/lib/auth/super-admin';

export async function POST(request: Request) {
  const body = await request.json();
  const email = normalizeEmail(body.email ?? '');
  const code = String(body.code ?? '').trim();

  if (!email.includes('@') || code.length !== 6) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!isSuperAdminEmail(email)) {
    return NextResponse.json({ error: 'Email sign-in is not enabled for this address' }, { status: 403 });
  }

  if (!checkEmailOtp(email, code)) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
