import { NextResponse } from 'next/server';
import { consumeMagicLink } from '@/lib/auth/magic-link-server';
import { issuePasswordSetupToken } from '@/lib/auth/password-server';
import { getMemberStatusForEmail, isLoginBlockedMemberStatus } from '@/lib/members/status-server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const body = await request.json();
  const token = (body.token ?? '').trim();
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  const entry = await consumeMagicLink(db, token);
  if (!entry) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 401 });
  }

  if (!entry.allowVisitor) {
    const memberStatus = await getMemberStatusForEmail(db, entry.email);
    if (isLoginBlockedMemberStatus(memberStatus)) {
      return NextResponse.json(
        { error: 'Your membership is suspended. Contact your campus admin.' },
        { status: 403 },
      );
    }
  }

  let needsPassword = false;
  let setupToken: string | undefined;

  if (!entry.allowVisitor) {
    const { data: profile } = await db
      .from('profiles')
      .select('password_hash')
      .ilike('email', entry.email)
      .maybeSingle();

    if (profile && !profile.password_hash) {
      needsPassword = true;
      setupToken = await issuePasswordSetupToken(db, entry.email);
    }
  }

  return NextResponse.json({ ...entry, needsPassword, setupToken });
}
