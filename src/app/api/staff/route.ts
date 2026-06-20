import { NextResponse } from 'next/server';
import type { CampusId } from '@/lib/church/constants';
import { normalizeEmail } from '@/lib/auth/super-admin';
import {
  canManageStaffRoles,
  resolveStaffActor,
} from '@/lib/auth/staff-access-server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { AssignableStaffRole } from '@/lib/staff/types';

function mapStaffRow(row: {
  id: string;
  email: string | null;
  phone: string;
  role: string;
  campus_id: string | null;
  display_name: string | null;
  official_name: string | null;
  username: string | null;
  created_at: string;
}) {
  return {
    id: row.id,
    email: row.email ?? '',
    phone: row.phone,
    role: row.role,
    campusId: row.campus_id as CampusId | null,
    displayName: row.display_name ?? row.username ?? row.official_name ?? '',
    officialName: row.official_name ?? row.display_name ?? '',
    username: row.username,
    createdAt: row.created_at,
  };
}

async function nextStaffPhone(db: ReturnType<typeof getSupabaseAdmin>): Promise<string> {
  if (!db) return `staff${Date.now().toString().slice(-6)}`;
  const { data } = await db.from('profiles').select('phone').like('phone', 'staff%');
  let max = 4;
  for (const row of data ?? []) {
    const match = row.phone.match(/^staff0*(\d+)$/);
    if (match) max = Math.max(max, parseInt(match[1], 10));
  }
  return `staff${String(max + 1).padStart(6, '0')}`;
}

export async function GET(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const actor = await resolveStaffActor(request);
  if (!actor || !canManageStaffRoles(actor)) {
    return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
  }

  const { data, error } = await db
    .from('profiles')
    .select('id, email, phone, role, campus_id, display_name, official_name, username, created_at')
    .in('role', ['super_admin', 'admin', 'pastor', 'leader'])
    .order('role')
    .order('display_name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(mapStaffRow));
}

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const actor = await resolveStaffActor(request);
  if (!actor || !canManageStaffRoles(actor)) {
    return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
  }

  const body = await request.json();
  const email = normalizeEmail(body.email ?? '');
  const role = body.role as AssignableStaffRole;
  const campusId = body.campusId as CampusId;
  const displayName = (body.displayName ?? body.officialName ?? '').trim();
  const officialName = (body.officialName ?? displayName).trim();

  if (!email.includes('@') || !displayName || !campusId) {
    return NextResponse.json({ error: 'Email, name, and campus are required' }, { status: 400 });
  }

  if (!['admin', 'pastor', 'leader'].includes(role)) {
    return NextResponse.json(
      { error: 'Role must be admin (campus admin), pastor, or leader' },
      { status: 400 },
    );
  }

  const { data: existing } = await db
    .from('profiles')
    .select('*')
    .ilike('email', email)
    .maybeSingle();

  if (existing) {
    if (existing.role === 'super_admin') {
      return NextResponse.json({ error: 'Cannot change super admin role here' }, { status: 400 });
    }

    const { data: updated, error: updateError } = await db
      .from('profiles')
      .update({
        role,
        campus_id: campusId,
        display_name: displayName,
        official_name: officialName,
        username: existing.username ?? displayName.toLowerCase().replace(/\s+/g, '_'),
      })
      .eq('id', existing.id)
      .select('id, email, phone, role, campus_id, display_name, official_name, username, created_at')
      .single();

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
    return NextResponse.json(mapStaffRow(updated));
  }

  const phone = await nextStaffPhone(db);
  const { data: created, error: insertError } = await db
    .from('profiles')
    .insert({
      phone,
      email,
      role,
      campus_id: campusId,
      display_name: displayName,
      official_name: officialName,
      username: displayName.toLowerCase().replace(/\s+/g, '_').slice(0, 32),
    })
    .select('id, email, phone, role, campus_id, display_name, official_name, username, created_at')
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  return NextResponse.json(mapStaffRow(created));
}
