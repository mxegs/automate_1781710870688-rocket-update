import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { sessionProfileDenied, sessionProfileFromRequest } from '@/lib/notifications/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const session = await sessionProfileFromRequest(request);
  if (!session) return sessionProfileDenied();

  const { id } = await params;
  const { data, error } = await db
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
    .eq('profile_id', session.id)
    .eq('church_id', session.churchId)
    .select('id, read_at')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return sessionProfileDenied();

  return NextResponse.json({ id: data.id, readAt: data.read_at });
}
