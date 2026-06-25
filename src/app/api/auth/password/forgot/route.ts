import { NextResponse } from 'next/server';
import { getAppUrl } from '@/lib/app-url';
import { issuePasswordSetupToken } from '@/lib/auth/password-server';
import { ensureProfileForEmail } from '@/lib/auth/profile-sync';
import { isSuperAdminEmail, normalizeEmail } from '@/lib/auth/super-admin';
import { sendPasswordResetEmail } from '@/lib/email/service';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const body = await request.json();
  const email = normalizeEmail(String(body.email ?? ''));

  if (!email.includes('@')) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }

  // Never expose whether super-admin exists — same response as unknown email
  if (isSuperAdminEmail(email)) {
    return NextResponse.json({
      ok: true,
      message: 'If that email is registered, we sent a reset link.',
    });
  }

  const { data: profile } = await db
    .from('profiles')
    .select('id, email, password_hash, role')
    .ilike('email', email)
    .maybeSingle();

  let resolved = profile;
  if (!resolved?.email) {
    const synced = await ensureProfileForEmail(db, email);
    if (synced?.email) {
      resolved = {
        id: '',
        email: synced.email,
        password_hash: synced.password_hash,
        role: synced.role,
      };
    }
  }

  if (!resolved?.email) {
    return NextResponse.json({
      ok: true,
      message: 'If that email is registered, we sent a reset link.',
    });
  }

  if (resolved.role === 'super_admin') {
    return NextResponse.json({
      ok: true,
      message: 'If that email is registered, we sent a reset link.',
    });
  }

  const token = issuePasswordSetupToken(email);
  const resetUrl = `${getAppUrl(request)}/reset-password?token=${encodeURIComponent(token)}`;
  await sendPasswordResetEmail(email, resetUrl);

  return NextResponse.json({
    ok: true,
    message: 'If that email is registered, we sent a reset link.',
    demoLink: process.env.EMAIL_PROVIDER === 'demo' ? resetUrl : undefined,
  });
}
