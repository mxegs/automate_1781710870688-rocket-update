import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { mapInvite } from '@/lib/supabase/mappers';
import { normalizePhone } from '@/lib/auth/session';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const { token } = await params;
  const { data, error } = await db
    .from('invites')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Invite not found' }, { status: 404 });

  let churchSlug: string | null = null;
  let churchName: string | null = null;
  const churchId = (data as { church_id?: string | null }).church_id;
  if (churchId) {
    const { data: church } = await db
      .from('churches')
      .select('slug, name')
      .eq('id', churchId)
      .maybeSingle();
    churchSlug = church?.slug ?? null;
    churchName = church?.name ?? null;
  }

  return NextResponse.json(mapInvite({ ...data, churchSlug, churchName }));
}
