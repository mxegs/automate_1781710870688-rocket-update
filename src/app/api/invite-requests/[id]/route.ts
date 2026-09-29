import { NextResponse } from 'next/server';
import {
  canManageCampus,
  canManageInvites,
  resolveStaffActor,
} from '@/lib/auth/staff-access-server';
import type { CampusId } from '@/lib/church/constants';
import { notFoundResponse, requireSessionChurchId } from '@/lib/auth/session-church';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { mapInviteRequest } from '@/lib/supabase/mappers';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await resolveStaffActor(request);
  if (!actor || !canManageInvites(actor)) return notFoundResponse();

  const churchId = await requireSessionChurchId(request);
  if (churchId instanceof NextResponse) return churchId;

  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const { id } = await params;
  const { data: row } = await db
    .from('invite_requests')
    .select('id, church_id, campus_id')
    .eq('id', id)
    .maybeSingle();
  if (!row || row.church_id !== churchId) return notFoundResponse();
  if (!canManageCampus(actor, row.campus_id as CampusId)) return notFoundResponse();

  const body = await request.json();

  const { data, error } = await db
    .from('invite_requests')
    .update({
      status: body.status,
      notes: body.notes ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('church_id', churchId)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapInviteRequest(data));
}
