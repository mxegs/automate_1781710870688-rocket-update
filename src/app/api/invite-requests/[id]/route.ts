import { NextResponse } from 'next/server';
import { notFoundResponse, requireSessionChurchId } from '@/lib/auth/session-church';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { mapInviteRequest } from '@/lib/supabase/mappers';

function churchIdFromNotes(notes: string | null | undefined): string | null {
  const match = /^church:([^\n]+)/.exec(notes ?? '');
  return match?.[1]?.trim() || null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const churchId = await requireSessionChurchId(request);
  if (churchId instanceof NextResponse) return churchId;

  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const { id } = await params;
  const { data: row } = await db.from('invite_requests').select('id, notes').eq('id', id).maybeSingle();
  if (!row || churchIdFromNotes(row.notes) !== churchId) return notFoundResponse();

  const body = await request.json();
  const staffNotes = typeof body.notes === 'string' ? body.notes : '';
  const notes = `church:${churchId}${staffNotes ? `\n${staffNotes}` : ''}`;

  const { data, error } = await db
    .from('invite_requests')
    .update({
      status: body.status,
      notes,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapInviteRequest(data));
}
