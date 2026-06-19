import type { CampusId } from '@/lib/church/constants';

/** Ministries (Worship, Kids) and community groups (Women, Youth) share the same structure */
export type GroupCategory = 'ministry' | 'community';

export interface ChurchGroup {
  id: string;
  name: string;
  category: GroupCategory;
  campus: CampusId;
  description?: string;
  /** Normalised phone of assigned group leader */
  leaderPhone: string;
  leaderName: string;
  memberPhones: string[];
  /** Worship / band groups can share song charts */
  enableSongLibrary: boolean;
  createdAt: string;
}

export type BroadcastStatus = 'draft' | 'scheduled' | 'sent';

export interface GroupBroadcast {
  id: string;
  groupId: string;
  message: string;
  scheduledAt: string;
  status: BroadcastStatus;
  createdAt: string;
  createdByPhone: string;
}

export interface GroupSong {
  id: string;
  groupId: string;
  title: string;
  /** Musical key e.g. G, Bb, C#m */
  key: string;
  verse1: string;
  verse2: string;
  chorus: string;
  bridge?: string;
  notes?: string;
  createdAt: string;
  /** Set when leader sends chart to band */
  sentAt?: string;
}

export const MUSICAL_KEYS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  'Cm', 'C#m', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bbm', 'Bm',
] as const;
