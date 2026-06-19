import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { dbRoleToAppRole } from '@/lib/supabase/mappers';
import { normalizePhone } from '@/lib/auth/session';

export async function GET(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const phone = normalizePhone(searchParams.get('phone') ?? '');
  if (phone.length < 9) {
    return NextResponse.json({ error: 'Invalid phone' }, { status: 400 });
  }

  const suffix = phone.slice(-9);
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .or(`phone.eq.${phone},phone.eq.${suffix},phone.like.%${suffix}`)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json(null);

  return NextResponse.json({
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
