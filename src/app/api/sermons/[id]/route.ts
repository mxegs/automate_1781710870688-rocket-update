import { NextResponse } from 'next/server';
import { notFoundResponse, requireSessionChurchId } from '@/lib/auth/session-church';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function DELETE(
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
  const { data: row } = await db.from('media_items').select('id, church_id').eq('id', id).maybeSingle();
  if (!row || row.church_id !== churchId) return notFoundResponse();

  const { error } = await db.from('media_items').delete().eq('id', id).eq('church_id', churchId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
