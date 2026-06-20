import { NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth/password-server';
import { isSuperAdminEmail, normalizeEmail } from '@/lib/auth/super-admin';
import { getMemberStatusForEmail, isLoginBlockedMemberStatus } from '@/lib/members/status-server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { dbRoleToAppRole } from '@/lib/supabase/mappers';

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const body = await request.json();
  const email = normalizeEmail(String(body.email ?? ''));
  const password = String(body.password ?? '');

  if (!email.includes('@') || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const { data: profile, error } = await db
    .from('profiles')
    .select('email, phone, role, campus_id, official_name, username, display_name, password_hash')
    .ilike('email', email)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!profile?.email) {
    return NextResponse.json({ error: 'No account found for this email' }, { status: 404 });
  }

  const memberStatus = await getMemberStatusForEmail(db, email);
  if (isLoginBlockedMemberStatus(memberStatus)) {
    return NextResponse.json(
      { error: 'Your membership is suspended. Contact your campus admin.' },
      { status: 403 },
    );
  }

  if (!profile.password_hash) {
    return NextResponse.json(
      { error: 'Password sign-in is not set up for this account yet. Contact your admin.' },
      { status: 400 },
    );
  }

  const valid = await verifyPassword(password, profile.password_hash);
  if (!valid) {
    return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 });
  }

  return NextResponse.json({
    email: profile.email,
    phone: profile.phone,
    role: dbRoleToAppRole(profile.role),
    campusId: profile.campus_id,
    officialName: profile.official_name,
    username: profile.username,
    displayName: profile.display_name,
    isSuperAdmin: profile.role === 'super_admin' || isSuperAdminEmail(profile.email),
    dbRole: profile.role,
  });
}
