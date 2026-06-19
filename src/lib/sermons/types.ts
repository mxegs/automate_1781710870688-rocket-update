import type { CampusId } from '@/lib/church/constants';

export type MediaType = 'Sermon' | 'Audio' | 'Book' | 'Special Message';
export type ContentVisibility = 'campus_only' | 'church_wide' | 'members_only';

export interface MediaItem {
  id: string;
  campus: CampusId;
  visibility: ContentVisibility;
  type: MediaType;
  title: string;
  preacher: string;
  date: string;
  month: string;
  year: number;
  category: string;
  series?: string;
  description: string;
  duration: string;
  youtubeId?: string;
  externalUrl?: string;
}

export const MEDIA_TYPES: MediaType[] = ['Sermon', 'Audio', 'Book', 'Special Message'];

export const VISIBILITY_OPTIONS: { value: ContentVisibility; label: string; hint: string }[] = [
  {
    value: 'campus_only',
    label: 'This campus only',
    hint: 'Regular services — Sunday, midweek, prayer (visible to this campus)',
  },
  {
    value: 'church_wide',
    label: 'All CKC campuses',
    hint: 'Special events — Easter, conferences, joint services',
  },
  {
    value: 'members_only',
    label: 'Members only (this campus)',
    hint: 'Congregation-only — not shown to visitors',
  },
];

export const SERMON_CATEGORIES = [
  'Sunday Service',
  'Midweek Service',
  'Prayer Meeting',
  'Bible Study',
  'Youth Conference',
  "Women's Day",
  'Easter',
  'Special Event',
] as const;

export interface MediaItemInput {
  campus: CampusId;
  visibility: ContentVisibility;
  type: MediaType;
  title: string;
  preacher: string;
  date: string;
  category: string;
  series?: string;
  description?: string;
  duration?: string;
  youtubeId?: string;
  externalUrl?: string;
}
