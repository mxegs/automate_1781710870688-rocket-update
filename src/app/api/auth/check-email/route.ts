import { NextResponse } from 'next/server';
import { normalizeEmail } from '@/lib/auth/super-admin';
import { getMemberStatusForEmail, isLoginBlockedMemberStatus } from '@/lib/members/status-server';
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
    .select('email, role, password_hash')
    .ilike('email', email)
    .maybeSingle();

  if (profile?.email && profile.role !== 'visitor') {
    const memberStatus = await getMemberStatusForEmail(db, email);
    if (isLoginBlockedMemberStatus(memberStatus)) {
      return NextResponse.json({
        registered: false,
        suspended: true,
        message: 'This membership is suspended. Contact your campus admin.',
      });
    }

    return NextResponse.json({
      registered: true,
      source: 'profile',
      role: profile.role,
      hasPassword: Boolean(profile.password_hash),
    });
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
