import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { mapInviteRequest } from '@/lib/supabase/mappers';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const { id } = await params;
  const body = await request.json();

  const { data, error } = await db
    .from('invite_requests')
    .update({
      status: body.status,
      notes: body.notes ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapInviteRequest(data));
}
