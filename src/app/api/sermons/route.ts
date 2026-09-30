import { NextResponse } from 'next/server';
import { churchIdFromUrl } from '@/lib/church/tenant';
import { churchIdForSessionEmail, notFoundResponse, requireSessionChurch } from '@/lib/auth/session-church';
import { churchIdFromSlugQuery } from '@/lib/church/lookup-server';
import { canUsePastoralStaffTools, resolveStaffActor } from '@/lib/auth/staff-access-server';
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

async function churchIdIfExists(
  db: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  churchId: string | null,
): Promise<string | null> {
  if (!churchId) return null;
  const { data } = await db.from('churches').select('id').eq('id', churchId).maybeSingle();
  return (data as { id?: string | null } | null)?.id?.trim() || null;
}

export async function GET(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const sessionChurchId = await churchIdForSessionEmail(request);
  const { searchParams } = new URL(request.url);
  const forAdmin = searchParams.get('forAdmin') === 'true';
  const campusId = searchParams.get('campusId');
  const allCampuses = searchParams.get('allCampuses') === 'true';
  const memberCampus = searchParams.get('memberCampus');
  const isVisitor = searchParams.get('isVisitor') === 'true';

  let churchId: string | null;
  let publicFeed = false;

  if (sessionChurchId) {
    const requested = churchIdFromUrl(request.url);
    const denied = await requireSessionChurch(request, requested);
    if (denied) return denied;
    churchId = requested;
  } else {
    const slugChurchId = await churchIdFromSlugQuery(db, request.url);
    const urlChurchId = await churchIdIfExists(db, churchIdFromUrl(request.url));
    if (slugChurchId && urlChurchId && slugChurchId !== urlChurchId) return notFoundResponse();
    churchId = slugChurchId || urlChurchId;
    if (!churchId) return notFoundResponse();
    publicFeed = true;
  }

  const { data, error } = await db
    .from('media_items')
    .select('*')
    .eq('church_id', churchId)
    .order('preached_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let items = (data ?? []).map(mapRow);

  if (publicFeed) {
    items = items.filter((r) => r.visibility === 'church_wide');
  } else if (forAdmin) {
    const actor = await resolveStaffActor(request);
    if (!actor || !canUsePastoralStaffTools(actor)) {
      items = filterFeed(items, memberCampus, isVisitor);
    } else if (!allCampuses && campusId) {
      items = items.filter((i) => i.campus === campusId);
    }
  } else {
    items = filterFeed(items, memberCampus, isVisitor);
  }

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const churchId = churchIdFromUrl(request.url);
  const denied = await requireSessionChurch(request, churchId);
  if (denied) return denied;

  const actor = await resolveStaffActor(request);
  if (!actor || !canUsePastoralStaffTools(actor)) return notFoundResponse();

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
      church_id: churchId,
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
