import { NextResponse } from 'next/server';
import { consumeMagicLink } from '@/lib/auth/magic-link-server';

export async function POST(request: Request) {
  const body = await request.json();
  const token = (body.token ?? '').trim();
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  const entry = consumeMagicLink(token);
  if (!entry) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 401 });
  }

  return NextResponse.json(entry);
}
