import { NextResponse } from 'next/server';
import type { CampusId } from '@/lib/church/constants';
import {
  canManageStaffRoles,
  resolveStaffActor,
} from '@/lib/auth/staff-access-server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const actor = await resolveStaffActor(request);
  if (!actor || !canManageStaffRoles(actor)) {
    return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const { data: target } = await db.from('profiles').select('role').eq('id', id).maybeSingle();
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (target.role === 'super_admin') {
    return NextResponse.json({ error: 'Cannot modify super admin' }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (body.role !== undefined) patch.role = body.role;
  if (body.campusId !== undefined) patch.campus_id = body.campusId;
  if (body.displayName !== undefined) patch.display_name = body.displayName.trim();

  const { data, error } = await db
    .from('profiles')
    .update(patch)
    .eq('id', id)
    .select('id, email, phone, role, campus_id, display_name, official_name, username, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapStaffRow(data));
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const actor = await resolveStaffActor(request);
  if (!actor || !canManageStaffRoles(actor)) {
    return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
  }

  const { id } = await params;

  const { data: target } = await db.from('profiles').select('role').eq('id', id).maybeSingle();
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (target.role === 'super_admin') {
    return NextResponse.json({ error: 'Cannot remove super admin' }, { status: 400 });
  }

  const { error } = await db
    .from('profiles')
    .update({ role: 'member' })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
