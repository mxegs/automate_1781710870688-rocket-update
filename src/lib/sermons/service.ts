import { apiFetch, useBackend } from '@/lib/api/client';
import type { CampusId } from '@/lib/church/constants';
import type { ContentVisibility, MediaItem, MediaItemInput, MediaType } from './types';

const DB_TYPE_TO_APP: Record<string, MediaType> = {
  sermon: 'Sermon',
  audio: 'Audio',
  book: 'Book',
  special_message: 'Special Message',
};

const APP_TYPE_TO_DB: Record<MediaType, string> = {
  Sermon: 'sermon',
  Audio: 'audio',
  Book: 'book',
  'Special Message': 'special_message',
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
    campus: row.campus_id as CampusId,
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

export async function getAdminMediaItems(options: {
  campusId?: CampusId;
  allCampuses?: boolean;
}): Promise<MediaItem[]> {
  if (!useBackend()) return [];

  const params = new URLSearchParams({ forAdmin: 'true' });
  if (options.allCampuses) params.set('allCampuses', 'true');
  else if (options.campusId) params.set('campusId', options.campusId);

  return apiFetch<MediaItem[]>(`/api/sermons?${params}`);
}

export async function getMemberMediaFeed(options: {
  memberCampus?: CampusId;
  isVisitor?: boolean;
}): Promise<MediaItem[]> {
  if (!useBackend()) return [];

  const params = new URLSearchParams();
  if (options.memberCampus) params.set('memberCampus', options.memberCampus);
  if (options.isVisitor) params.set('isVisitor', 'true');

  return apiFetch<MediaItem[]>(`/api/sermons?${params}`);
}

export async function createMediaItem(input: MediaItemInput): Promise<MediaItem> {
  return apiFetch<MediaItem>('/api/sermons', {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      mediaType: APP_TYPE_TO_DB[input.type],
    }),
  });
}

export async function deleteMediaItem(id: string): Promise<void> {
  await apiFetch(`/api/sermons/${id}`, { method: 'DELETE' });
}

export { mapRow as mapMediaItemRow };
