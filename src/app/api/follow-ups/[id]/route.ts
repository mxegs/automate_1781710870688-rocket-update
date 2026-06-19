import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { FollowUpContact } from '@/lib/followups/service';
import type { CampusId, FollowUpStageId } from '@/lib/church/constants';

function mapRow(row: Record<string, unknown>): FollowUpContact {
  return {
    id: row.id as string,
    name: row.name as string,
    phone: row.phone as string,
    campus: row.campus_id as CampusId,
    stage: row.stage as FollowUpStageId,
    source: (row.source as string) ?? '',
    lastContact: row.last_contact_at
      ? new Date(row.last_contact_at as string).toLocaleDateString('en-ZA', {
          day: 'numeric',
          month: 'short',
        })
      : '—',
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const { id } = await params;
  const body = await request.json();

  const updates: Record<string, unknown> = { last_contact_at: new Date().toISOString() };
  if (body.stage) updates.stage = body.stage;

  const { data, error } = await db.from('follow_ups').update(updates).eq('id', id).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapRow(data));
}
