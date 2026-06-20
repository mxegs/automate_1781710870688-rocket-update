import type { UserRole as DbUserRole } from './types';
import type { UserRole } from '@/lib/auth/session';
import type { ChurchGroup, GroupBroadcast, GroupSong } from '@/lib/groups/types';
import type { InviteRequest } from '@/lib/invites/request-service';
import type { PendingInvite } from '@/lib/invites/service';
import type { CampusId } from '@/lib/church/constants';

type GroupRow = {
  id: string;
  name: string;
  category: 'ministry' | 'community';
  campus_id: string;
  description: string | null;
  leader_phone: string;
  leader_name: string;
  enable_song_library: boolean;
  created_at: string;
  group_members?: { member_phone: string }[];
};

export function dbRoleToAppRole(role: DbUserRole): UserRole {
  if (role === 'super_admin') return 'admin';
  if (role === 'senior_pastor') return 'senior_pastor';
  if (role === 'administrative_manager') return 'administrative_manager';
  return role as UserRole;
}

export function mapInviteRequest(row: {
  id: string;
  surname: string;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  campus_id?: string | null;
  status: 'pending' | 'approved' | 'declined';
  notes: string | null;
  requested_at: string;
}): InviteRequest {
  return {
    id: row.id,
    surname: row.surname,
    fullName: row.full_name,
    phone: row.phone ?? undefined,
    email: row.email ?? '',
    campus: (row.campus_id as CampusId) || 'midrand',
    status: row.status,
    notes: row.notes ?? undefined,
    requestedAt: row.requested_at,
  };
}

export function mapInvite(row: {
  id: string;
  token: string;
  phone: string;
  email?: string | null;
  official_name: string;
  given_name?: string | null;
  surname?: string | null;
  username: string | null;
  sent_at: string;
  status: 'pending' | 'accepted' | 'expired';
}): PendingInvite {
  return {
    id: row.id,
    token: row.token,
    phone: row.phone,
    email: row.email ?? undefined,
    officialName: row.official_name,
    givenName: row.given_name ?? undefined,
    surname: row.surname ?? undefined,
    username: row.username ?? undefined,
    sentAt: row.sent_at,
    status: row.status === 'accepted' ? 'accepted' : 'pending',
  };
}

export function mapGroup(row: GroupRow): ChurchGroup {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    campus: row.campus_id as CampusId,
    description: row.description ?? undefined,
    leaderPhone: row.leader_phone,
    leaderName: row.leader_name,
    memberPhones: row.group_members?.map((m) => m.member_phone) ?? [],
    enableSongLibrary: row.enable_song_library,
    createdAt: row.created_at,
  };
}

export function mapBroadcast(row: {
  id: string;
  group_id: string;
  message: string;
  scheduled_at: string;
  status: 'draft' | 'scheduled' | 'sent';
  created_by_phone: string | null;
  created_at: string;
}): GroupBroadcast {
  return {
    id: row.id,
    groupId: row.group_id,
    message: row.message,
    scheduledAt: row.scheduled_at,
    status: row.status,
    createdByPhone: row.created_by_phone ?? '',
    createdAt: row.created_at,
  };
}

export function mapSong(row: {
  id: string;
  group_id: string;
  title: string;
  musical_key: string;
  verse1: string;
  verse2: string;
  chorus: string;
  bridge: string | null;
  notes: string | null;
  sent_at: string | null;
  created_at: string;
}): GroupSong {
  return {
    id: row.id,
    groupId: row.group_id,
    title: row.title,
    key: row.musical_key,
    verse1: row.verse1,
    verse2: row.verse2,
    chorus: row.chorus,
    bridge: row.bridge ?? undefined,
    notes: row.notes ?? undefined,
    sentAt: row.sent_at ?? undefined,
    createdAt: row.created_at,
  };
}

export function generateToken(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 12);
}
