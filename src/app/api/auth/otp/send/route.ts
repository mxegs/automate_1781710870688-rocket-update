import { NextResponse } from 'next/server';
import { issueOtp } from '@/lib/auth/otp-server';
import { normalizePhone } from '@/lib/auth/session';
import { buildOtpSmsMessage, sendSms } from '@/lib/sms/service';

export async function POST(request: Request) {
  const body = await request.json();
  const phone = normalizePhone(body.phone ?? '');

  if (phone.length < 9) {
    return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
  }

  const code = issueOtp(phone);
  const result = await sendSms(phone, buildOtpSmsMessage(code));

  if (!result.success) {
    return NextResponse.json({ error: result.error ?? 'Could not send OTP' }, { status: 502 });
  }

  return NextResponse.json({ ok: true, demo: result.demo ?? false });
}
