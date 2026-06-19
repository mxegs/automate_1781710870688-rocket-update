import type { CampusId } from '@/lib/church/constants';
import type { ContentVisibility } from '@/lib/sermons/types';

export type AnnouncementStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type RepeatInterval = 'none' | 'weekly' | 'monthly';

export interface Announcement {
  id: string;
  campus: CampusId;
  visibility: ContentVisibility;
  title: string;
  content: string;
  category: string;
  authorName?: string;
  pinned: boolean;
  status: AnnouncementStatus;
  publishAt?: string;
  expiresAt?: string;
  repeatInterval: RepeatInterval;
  repeatUntil?: string;
  date: string;
}

export interface AnnouncementInput {
  campus: CampusId;
  visibility: ContentVisibility;
  title: string;
  content: string;
  category: string;
  authorName?: string;
  pinned?: boolean;
  status: AnnouncementStatus;
  publishAt?: string;
  expiresAt?: string;
  repeatInterval?: RepeatInterval;
  repeatUntil?: string;
}

export const ANNOUNCEMENT_CATEGORIES = ['General', 'Events', 'Outreach', 'Youth', 'Ministry'] as const;

export const REPEAT_OPTIONS: { value: RepeatInterval; label: string }[] = [
  { value: 'none', label: 'No repeat' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];
