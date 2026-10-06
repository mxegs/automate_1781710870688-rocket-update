import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { sessionProfileDenied, sessionProfileFromRequest } from '@/lib/notifications/server';

export async function GET(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const session = await sessionProfileFromRequest(request);
  if (!session) return sessionProfileDenied();

  const unreadOnly = new URL(request.url).searchParams.get('unreadOnly') === 'true';

  let listQuery = db
    .from('notifications')
    .select('id, type, title, body, action_url, read_at, created_at')
    .eq('profile_id', session.id)
    .eq('church_id', session.churchId)
    .order('created_at', { ascending: false });

  if (unreadOnly) listQuery = listQuery.is('read_at', null);

  const [{ count: unreadCount, error: countError }, { data, error }] = await Promise.all([
    db
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', session.id)
      .eq('church_id', session.churchId)
      .is('read_at', null),
    listQuery,
  ]);

  if (countError) return NextResponse.json({ error: countError.message }, { status: 500 });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    unreadCount: unreadCount ?? 0,
    notifications: (data ?? []).map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      body: row.body,
      actionUrl: row.action_url,
      readAt: row.read_at,
      createdAt: row.created_at,
    })),
  });
}
