import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { extractYoutubeId } from '@/lib/sermons/utils';
import type { ContentVisibility, MediaItem, MediaType } from '@/lib/sermons/types';

const DB_TYPE_TO_APP: Record<string, MediaType> = {
  sermon: 'Sermon',
  audio: 'Audio',
  book: 'Book',
  special_message: 'Special Message',
};

function mapRow(row: {
  id: string;
  campus_id: string;
  visibility: ContentVisibility;
  media_type: string;
  title: string;
  preacher: string;
  preached_at: string;
  category: string;
  series: string | null;
  description: string | null;
  duration: string | null;
  youtube_id: string | null;
  external_url: string | null;
}): MediaItem {
  const d = new Date(`${row.preached_at}T12:00:00`);
  return {
    id: row.id,
    campus: row.campus_id as MediaItem['campus'],
    visibility: row.visibility,
    type: DB_TYPE_TO_APP[row.media_type] ?? 'Sermon',
    title: row.title,
    preacher: row.preacher,
    date: d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }),
    month: d.toLocaleDateString('en-ZA', { month: 'long' }),
    year: d.getFullYear(),
    category: row.category,
    series: row.series ?? undefined,
    description: row.description ?? '',
    duration: row.duration ?? '',
    youtubeId: row.youtube_id ?? undefined,
    externalUrl: row.external_url ?? undefined,
  };
}

function filterFeed(
  rows: MediaItem[],
  memberCampus: string | null,
  isVisitor: boolean,
): MediaItem[] {
  if (isVisitor) {
    return rows.filter((r) => r.visibility === 'church_wide');
  }
  if (!memberCampus) {
    return rows.filter((r) => r.visibility === 'church_wide');
  }
  return rows.filter(
    (r) =>
      r.visibility === 'church_wide' ||
      (r.campus === memberCampus &&
        (r.visibility === 'campus_only' || r.visibility === 'members_only')),
  );
}

export async function GET(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const forAdmin = searchParams.get('forAdmin') === 'true';
  const campusId = searchParams.get('campusId');
  const allCampuses = searchParams.get('allCampuses') === 'true';
  const memberCampus = searchParams.get('memberCampus');
  const isVisitor = searchParams.get('isVisitor') === 'true';

  const { data, error } = await db
    .from('media_items')
    .select('*')
    .order('preached_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let items = (data ?? []).map(mapRow);

  if (forAdmin) {
    if (!allCampuses && campusId) {
      items = items.filter((i) => i.campus === campusId);
    }
  } else {
    items = filterFeed(items, memberCampus, isVisitor);
  }

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const body = await request.json();
  const youtubeId = body.youtubeId ? extractYoutubeId(body.youtubeId) : null;
  const externalUrl = body.externalUrl?.trim() || null;

  if (!body.title?.trim() || !body.preacher?.trim() || !body.date || !body.campus) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!youtubeId && !externalUrl) {
    return NextResponse.json({ error: 'Add a YouTube link/ID or external URL (Spotify, etc.)' }, { status: 400 });
  }

  const { data, error } = await db
    .from('media_items')
    .insert({
      campus_id: body.campus,
      visibility: body.visibility ?? 'campus_only',
      media_type: body.mediaType ?? 'sermon',
      title: body.title.trim(),
      preacher: body.preacher.trim(),
      preached_at: body.date,
      category: body.category ?? 'Sunday Service',
      series: body.series?.trim() || null,
      description: body.description?.trim() || null,
      duration: body.duration?.trim() || null,
      youtube_id: youtubeId,
      external_url: externalUrl,
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapRow(data));
}
