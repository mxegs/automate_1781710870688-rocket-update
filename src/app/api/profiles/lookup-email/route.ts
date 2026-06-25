import { NextResponse } from 'next/server';
import { ensureProfileForEmail } from '@/lib/auth/profile-sync';
import { normalizeEmail } from '@/lib/auth/super-admin';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { dbRoleToAppRole } from '@/lib/supabase/mappers';

export async function GET(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const email = normalizeEmail(searchParams.get('email') ?? '');
  if (!email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const { data, error } = await db
    .from('profiles')
    .select('*')
    .ilike('email', email)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const row = data ?? (await ensureProfileForEmail(db, email));
  if (!row) return NextResponse.json(null);

  return NextResponse.json({
    email: row.email,
    phone: row.phone,
    role: dbRoleToAppRole(row.role),
    dbRole: row.role,
    isSuperAdmin: row.role === 'super_admin',
    officialName: row.official_name,
    username: row.username,
    displayName: row.display_name,
    campusId: row.campus_id,
  });
}
