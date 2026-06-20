import { NextResponse } from 'next/server';
import { consumeMagicLink } from '@/lib/auth/magic-link-server';
import { issuePasswordSetupToken } from '@/lib/auth/password-server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

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

  let needsPassword = false;
  let setupToken: string | undefined;

  if (!entry.allowVisitor) {
    const db = getSupabaseAdmin();
    if (db) {
      const { data: profile } = await db
        .from('profiles')
        .select('password_hash')
        .ilike('email', entry.email)
        .maybeSingle();

      if (profile && !profile.password_hash) {
        needsPassword = true;
        setupToken = issuePasswordSetupToken(entry.email);
      }
    }
  }

  return NextResponse.json({ ...entry, needsPassword, setupToken });
}
