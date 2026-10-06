import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { sessionProfileDenied, sessionProfileFromRequest } from '@/lib/notifications/server';

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const session = await sessionProfileFromRequest(request);
  if (!session) return sessionProfileDenied();

  const { error } = await db
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('profile_id', session.id)
    .eq('church_id', session.churchId)
    .is('read_at', null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
