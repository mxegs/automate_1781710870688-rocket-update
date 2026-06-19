import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { Announcement, AnnouncementStatus, RepeatInterval } from '@/lib/announcements/types';
import type { ContentVisibility } from '@/lib/sermons/types';

function mapRow(row: Record<string, unknown>): Announcement {
  return {
    id: row.id as string,
    campus: row.campus_id as Announcement['campus'],
    visibility: row.visibility as ContentVisibility,
    title: row.title as string,
    content: row.content as string,
    category: row.category as string,
    authorName: (row.author_name as string) ?? undefined,
    pinned: Boolean(row.pinned),
    status: row.status as AnnouncementStatus,
    publishAt: (row.publish_at as string) ?? undefined,
    expiresAt: (row.expires_at as string) ?? undefined,
    repeatInterval: (row.repeat_interval as RepeatInterval) ?? 'none',
    repeatUntil: (row.repeat_until as string) ?? undefined,
    date: new Date((row.publish_at ?? row.created_at) as string).toLocaleDateString('en-ZA', {
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
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const { id } = await params;
  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.content !== undefined) updates.content = body.content.trim();
  if (body.campus !== undefined) updates.campus_id = body.campus;
  if (body.visibility !== undefined) updates.visibility = body.visibility;
  if (body.category !== undefined) updates.category = body.category;
  if (body.pinned !== undefined) updates.pinned = body.pinned;
  if (body.status !== undefined) {
    updates.status = body.status;
    if (body.status === 'published') updates.publish_at = new Date().toISOString();
  }
  if (body.publishAt !== undefined) updates.publish_at = body.publishAt;
  if (body.expiresAt !== undefined) updates.expires_at = body.expiresAt;
  if (body.repeatInterval !== undefined) updates.repeat_interval = body.repeatInterval;
  if (body.repeatUntil !== undefined) updates.repeat_until = body.repeatUntil;

  const { data, error } = await db.from('announcements').update(updates).eq('id', id).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapRow(data));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const { id } = await params;
  const { error } = await db.from('announcements').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
