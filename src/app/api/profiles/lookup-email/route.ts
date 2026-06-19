import { NextResponse } from 'next/server';
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
  if (!data) return NextResponse.json(null);

  return NextResponse.json({
    email: data.email,
    phone: data.phone,
    role: dbRoleToAppRole(data.role),
    dbRole: data.role,
    isSuperAdmin: data.role === 'super_admin',
    officialName: data.official_name,
    username: data.username,
    displayName: data.display_name,
    campusId: data.campus_id,
  });
}
