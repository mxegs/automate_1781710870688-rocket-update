import { NextResponse } from 'next/server';
import {
  consumePasswordSetupToken,
  hashPassword,
  validatePasswordStrength,
} from '@/lib/auth/password-server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

/** Set password on an existing profile (staff/admin) using a one-time setup token. */
export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const body = await request.json();
  const setupToken = String(body.setupToken ?? '').trim();
  const password = String(body.password ?? '');

  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  if (!setupToken) {
    return NextResponse.json({ error: 'Setup token is required' }, { status: 400 });
  }

  const email = consumePasswordSetupToken(setupToken);
  if (!email) {
    return NextResponse.json({ error: 'Setup link expired. Sign in with email link again.' }, { status: 401 });
  }

  const { data: profile, error: fetchError } = await db
    .from('profiles')
    .select('id, email')
    .ilike('email', email)
    .maybeSingle();

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (!profile?.email) {
    return NextResponse.json({ error: 'No profile found for this email' }, { status: 404 });
  }

  const passwordHash = await hashPassword(password);

  const { error } = await db
    .from('profiles')
    .update({ password_hash: passwordHash })
    .eq('id', profile.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, email: profile.email });
}
