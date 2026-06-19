import { NextResponse } from 'next/server';
import { revokeTrustedDevice } from '@/lib/auth/device-trust-server';

export async function POST(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? '').trim();
  if (!token) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  await revokeTrustedDevice(token);
  return NextResponse.json({ ok: true });
}
