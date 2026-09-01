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

  // Same public message whether the account exists or is super-admin.
  // Super-admin still gets a real reset token (email + local demo link).
  if (!resolved?.email && !isSuperAdminEmail(email)) {
    return NextResponse.json({
      ok: true,
      message: 'If that email is registered, we sent a reset link.',
    });
  }

  try {
    const token = await issuePasswordSetupToken(db, email);
    const resetUrl = `${getAppUrl(request)}/reset-password?token=${encodeURIComponent(token)}`;
    const emailResult = await sendPasswordResetEmail(email, resetUrl);
    const isDev = process.env.NODE_ENV !== 'production';

    return NextResponse.json({
      ok: true,
      message: 'If that email is registered, we sent a reset link.',
      demoLink: emailResult.demo || isDev ? resetUrl : undefined,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not create reset link' },
      { status: 500 },
    );
  }
}
