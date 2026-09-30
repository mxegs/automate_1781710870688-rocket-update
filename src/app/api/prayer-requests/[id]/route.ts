import { NextResponse } from 'next/server';
import { notFoundResponse, requireSessionChurchId } from '@/lib/auth/session-church';
import { canReviewPrayerInbox, resolveStaffActor } from '@/lib/auth/staff-access-server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { PrayerRequest, PrayerStatus } from '@/lib/prayer/types';

function mapRow(row: Record<string, unknown>): PrayerRequest {
  return {
    id: row.id as string,
    campus: row.campus_id as PrayerRequest['campus'],
    submitterName: row.submitter_name as string,
    contactPhone: (row.contact_phone as string) ?? undefined,
    contactEmail: (row.contact_email as string) ?? undefined,
    title: row.title as string,
    description: row.description as string,
    category: row.category as string,
    isConfidential: Boolean(row.is_confidential),
    status: row.status as PrayerStatus,
    date: new Date(row.created_at as string).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await resolveStaffActor(request);
  if (!actor || !canReviewPrayerInbox(actor)) return notFoundResponse();

  const churchId = await requireSessionChurchId(request);
  if (churchId instanceof NextResponse) return churchId;

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const { id } = await params;
  const { data: row } = await db.from('prayer_requests').select('id, church_id').eq('id', id).maybeSingle();
  if (!row || row.church_id !== churchId) return notFoundResponse();

  const body = await request.json();

  const { data, error } = await db
    .from('prayer_requests')
    .update({ status: body.status })
    .eq('id', id)
    .eq('church_id', churchId)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapRow(data));
}
