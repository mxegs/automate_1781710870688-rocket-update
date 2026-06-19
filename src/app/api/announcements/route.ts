import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { Announcement, AnnouncementStatus, RepeatInterval } from '@/lib/announcements/types';
import type { ContentVisibility } from '@/lib/sermons/types';

function filterAnnouncementFeed(
  items: Announcement[],
  memberCampus: string | null,
  isVisitor: boolean,
): Announcement[] {
  if (isVisitor) return items.filter((a) => a.visibility === 'church_wide');
  if (!memberCampus) return items.filter((a) => a.visibility === 'church_wide');
  return items.filter(
    (a) =>
      a.visibility === 'church_wide' ||
      (a.campus === memberCampus &&
        (a.visibility === 'campus_only' || a.visibility === 'members_only')),
  );
}

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

function isPublishedForFeed(row: Record<string, unknown>): boolean {
  const status = row.status as string;
  if (status === 'draft' || status === 'archived') return false;
  const now = Date.now();
  const publishAt = row.publish_at ? new Date(row.publish_at as string).getTime() : 0;
  if (status === 'scheduled' && publishAt > now) return false;
  if (row.expires_at && new Date(row.expires_at as string).getTime() < now) return false;
  return status === 'published' || status === 'scheduled';
}

export async function GET(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const forAdmin = searchParams.get('forAdmin') === 'true';
  const campusId = searchParams.get('campusId');
  const allCampuses = searchParams.get('allCampuses') === 'true';
  const memberCampus = searchParams.get('memberCampus');
  const isVisitor = searchParams.get('isVisitor') === 'true';

  const { data, error } = await db
    .from('announcements')
    .select('*')
    .order('pinned', { ascending: false })
    .order('publish_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let items = (data ?? []).map(mapRow);

  if (forAdmin) {
    if (!allCampuses && campusId) {
      items = items.filter((a) => a.campus === campusId || a.visibility === 'church_wide');
    }
  } else {
    const feedItems = (data ?? []).filter(isPublishedForFeed).map(mapRow);
    items = filterAnnouncementFeed(feedItems, memberCampus, isVisitor);
  }

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const body = await request.json();
  if (!body.title?.trim() || !body.content?.trim() || !body.campus) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const status = body.status ?? 'draft';
  const publishAt =
    status === 'published'
      ? new Date().toISOString()
      : body.publishAt || null;

  const { data, error } = await db
    .from('announcements')
    .insert({
      campus_id: body.campus,
      visibility: body.visibility ?? 'campus_only',
      title: body.title.trim(),
      content: body.content.trim(),
      category: body.category ?? 'General',
      author_name: body.authorName?.trim() || null,
      pinned: Boolean(body.pinned),
      status,
      publish_at: publishAt,
      expires_at: body.expiresAt || null,
      repeat_interval: body.repeatInterval ?? 'none',
      repeat_until: body.repeatUntil || null,
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapRow(data));
}
