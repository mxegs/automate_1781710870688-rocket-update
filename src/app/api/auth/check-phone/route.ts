import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { normalizePhone } from '@/lib/auth/session';

export async function GET(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const phone = normalizePhone(searchParams.get('phone') ?? '');
  if (phone.length < 9) {
    return NextResponse.json({ registered: false });
  }

  const suffix = phone.slice(-9);

  const { data: profile } = await db
    .from('profiles')
    .select('phone, role')
    .or(`phone.eq.${phone},phone.eq.${suffix},phone.like.%${suffix}`)
    .maybeSingle();

  if (profile && profile.role !== 'visitor') {
    return NextResponse.json({ registered: true, source: 'profile', profile });
  }

  const { data: invite } = await db
    .from('invites')
    .select('id')
    .or(`phone.eq.${phone},phone.eq.${suffix},phone.like.%${suffix}`)
    .eq('status', 'pending')
    .maybeSingle();

  if (invite) {
    return NextResponse.json({ registered: true, source: 'invite' });
  }

  return NextResponse.json({ registered: false });
}
