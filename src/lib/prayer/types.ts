import type { CampusId } from '@/lib/church/constants';

export type PrayerStatus = 'new' | 'assigned' | 'in_prayer' | 'answered' | 'closed';

export interface PrayerRequest {
  id: string;
  campus: CampusId;
  submitterName: string;
  contactPhone?: string;
  contactEmail?: string;
  title: string;
  description: string;
  category: string;
  isConfidential: boolean;
  status: PrayerStatus;
  date: string;
}

export interface PrayerRequestInput {
  campus: CampusId;
  submitterName: string;
  contactPhone?: string;
  contactEmail?: string;
  title: string;
  description: string;
  category: string;
  isConfidential?: boolean;
  profileId?: string;
}

export const PRAYER_CATEGORIES = [
  'Health',
  'Family',
  'Employment',
  'Financial',
  'Spiritual Growth',
  'Relationships',
  'Other',
] as const;

export const PRAYER_STATUS_LABELS: Record<PrayerStatus, string> = {
  new: 'New',
  assigned: 'Assigned',
  in_prayer: 'In Prayer',
  answered: 'Answered',
  closed: 'Closed',
};

export const PRAYER_AUTO_REPLY =
  'Thank you for sharing your prayer request with CKC. Our prayer team and pastors have received it and are lifting you up in prayer. God bless you.';
