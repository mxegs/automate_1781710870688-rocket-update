import { NextResponse } from 'next/server';
import {
  hashPassword,
  validatePasswordStrength,
  verifyPassword,
} from '@/lib/auth/password-server';
import { normalizeEmail } from '@/lib/auth/super-admin';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const body = await request.json();
  const email = normalizeEmail(String(body.email ?? ''));
  const currentPassword = String(body.currentPassword ?? '');
  const newPassword = String(body.newPassword ?? '');

  const passwordError = validatePasswordStrength(newPassword);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  if (!email.includes('@') || !currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Email, current password, and new password are required' }, { status: 400 });
  }

  const { data: profile, error: fetchError } = await db
    .from('profiles')
    .select('id, email, password_hash')
    .ilike('email', email)
    .maybeSingle();

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (!profile?.email || !profile.password_hash) {
    return NextResponse.json({ error: 'No password set for this account' }, { status: 400 });
  }

  const valid = await verifyPassword(currentPassword, profile.password_hash);
  if (!valid) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
  }

  const passwordHash = await hashPassword(newPassword);

  const { error } = await db
    .from('profiles')
    .update({ password_hash: passwordHash })
    .eq('id', profile.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
