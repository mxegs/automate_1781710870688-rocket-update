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

export async function GET(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const campusId = searchParams.get('campusId');
  const stage = searchParams.get('stage');

  let query = db.from('follow_ups').select('*').order('updated_at', { ascending: false });
  if (campusId) query = query.eq('campus_id', campusId);
  if (stage) query = query.eq('stage', stage);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(mapRow));
}
