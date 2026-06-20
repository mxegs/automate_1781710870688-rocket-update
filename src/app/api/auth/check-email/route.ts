import { NextResponse } from 'next/server';
import { normalizeEmail } from '@/lib/auth/super-admin';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const email = normalizeEmail(searchParams.get('email') ?? '');
  if (!email.includes('@')) {
    return NextResponse.json({ registered: false });
  }

  const { data: profile } = await db
    .from('profiles')
    .select('email, role')
    .ilike('email', email)
    .maybeSingle();

  if (profile?.email && profile.role !== 'visitor') {
    return NextResponse.json({ registered: true, source: 'profile', role: profile.role });
  }

  const { data: invite } = await db
    .from('invites')
    .select('id')
    .ilike('email', email)
    .eq('status', 'pending')
    .maybeSingle();

  if (invite) {
    return NextResponse.json({ registered: true, source: 'invite' });
  }

  return NextResponse.json({ registered: false });
}
