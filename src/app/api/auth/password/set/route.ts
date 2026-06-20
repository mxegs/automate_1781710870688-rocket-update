import { NextResponse } from 'next/server';
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password-server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const body = await request.json();
  const applicationId = String(body.applicationId ?? '').trim();
  const password = String(body.password ?? '');

  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  if (!applicationId) {
    return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
  }

  const { data: app, error: fetchError } = await db
    .from('membership_applications')
    .select('id, status, password_hash')
    .eq('id', applicationId)
    .maybeSingle();

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  if (app.status !== 'submitted') {
    return NextResponse.json({ error: 'This application can no longer be updated' }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);

  const { error } = await db
    .from('membership_applications')
    .update({ password_hash: passwordHash })
    .eq('id', applicationId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
