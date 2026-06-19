import { NextResponse } from 'next/server';
import { issueEmailOtp } from '@/lib/auth/email-otp-server';
import { isSuperAdminEmail, normalizeEmail } from '@/lib/auth/super-admin';
import { sendOtpEmail } from '@/lib/email/service';

export async function POST(request: Request) {
  const body = await request.json();
  const email = normalizeEmail(body.email ?? '');

  if (!email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  if (!isSuperAdminEmail(email)) {
    return NextResponse.json({ error: 'Email sign-in is not enabled for this address' }, { status: 403 });
  }

  const code = issueEmailOtp(email);
  const result = await sendOtpEmail(email, code);

  if (!result.success) {
    return NextResponse.json({ error: result.error ?? 'Could not send email' }, { status: 502 });
  }

  return NextResponse.json({ ok: true, demo: result.demo ?? false });
}
