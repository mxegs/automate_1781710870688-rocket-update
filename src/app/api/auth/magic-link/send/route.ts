import { NextResponse } from 'next/server';
import { getAppUrl } from '@/lib/app-url';
import { resolveEmailOtpPurpose } from '@/lib/auth/email-login-server';
import { issueMagicLink } from '@/lib/auth/magic-link-server';
import { normalizeEmail } from '@/lib/auth/super-admin';
import { sendMagicLinkEmail } from '@/lib/email/service';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const body = await request.json();
  const email = normalizeEmail(body.email ?? '');
  const allowVisitor = body.allowVisitor === true;

  if (!email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const allowed = await resolveEmailOtpPurpose(db, email, { allowVisitor });
  if (!allowed.ok) {
    return NextResponse.json({ error: allowed.error }, { status: 403 });
  }

  const token = issueMagicLink(email, allowVisitor);
  const signInUrl = `${getAppUrl(request)}/login/verify?token=${encodeURIComponent(token)}`;
  const result = await sendMagicLinkEmail(email, signInUrl);

  if (!result.success) {
    return NextResponse.json({ error: result.error ?? 'Could not send email' }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    demo: result.demo ?? false,
    demoLink: result.demo ? signInUrl : undefined,
  });
}
