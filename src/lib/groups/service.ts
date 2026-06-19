import { normalizePhone } from '@/lib/auth/session';
import { apiFetch, useBackend } from '@/lib/api/client';
import type { ChurchGroup, GroupBroadcast, GroupSong } from './types';

const GROUPS_KEY = 'ckc_groups';
const BROADCASTS_KEY = 'ckc_group_broadcasts';
const SONGS_KEY = 'ckc_group_songs';

const SEED_GROUPS: ChurchGroup[] = [
  {
    id: 'grp_worship',
    name: 'Worship Team',
    category: 'ministry',
    campus: 'midrand',
    description: 'Band and vocalists for Sunday services',
    leaderPhone: '735502016',
    leaderName: 'David Khumalo',
    memberPhones: ['821112222', '821113333'],
    enableSongLibrary: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'grp_kids',
    name: "Kids Church",
    category: 'ministry',
    campus: 'midrand',
    description: "Children's ministry team",
    leaderPhone: '821113333',
    leaderName: 'Nomsa Dlamini-Zulu',
    memberPhones: ['821112222'],
    enableSongLibrary: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'grp_women',
    name: "Women's Ministry",
    category: 'community',
    campus: 'verulam',
    description: 'Women fellowship and prayer',
    leaderPhone: '735502015',
    leaderName: 'Pastor Sarah Ndlovu',
    memberPhones: [],
    enableSongLibrary: false,
    createdAt: new Date().toISOString(),
  },
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

function ensureSeeded(): ChurchGroup[] {
  const existing = read<ChurchGroup[]>(GROUPS_KEY, []);
  if (existing.length === 0) {
    write(GROUPS_KEY, SEED_GROUPS);
    return SEED_GROUPS;
  }
  return existing;
}

export async function getAllGroups(): Promise<ChurchGroup[]> {
  if (useBackend()) {
    return apiFetch<ChurchGroup[]>('/api/groups');
  }
  return ensureSeeded();
}

export async function getGroupById(id: string): Promise<ChurchGroup | null> {
  if (useBackend()) {
    try {
      return await apiFetch<ChurchGroup>(`/api/groups/${id}`);
    } catch {
      return null;
    }
  }
  return ensureSeeded().find((g) => g.id === id) ?? null;
}

export async function getGroupsLedBy(phone: string): Promise<ChurchGroup[]> {
  const normalized = normalizePhone(phone);
  const all = await getAllGroups();
  return all.filter(
    (g) =>
      normalizePhone(g.leaderPhone) === normalized ||
      g.leaderPhone.endsWith(normalized.slice(-9)),
  );
}

export function canManageGroups(role: string): boolean {
  return role === 'admin' || role === 'pastor';
}

export async function createGroup(input: Omit<ChurchGroup, 'id' | 'createdAt'>): Promise<ChurchGroup> {
  if (useBackend()) {
    return apiFetch<ChurchGroup>('/api/groups', {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        category: input.category,
        campus: input.campus,
        description: input.description,
        leaderPhone: input.leaderPhone,
        leaderName: input.leaderName,
        memberPhones: input.memberPhones,
        enableSongLibrary: input.enableSongLibrary,
      }),
    });
  }

  const group: ChurchGroup = {
    ...input,
    id: `grp_${Date.now()}`,
    leaderPhone: normalizePhone(input.leaderPhone),
    memberPhones: input.memberPhones.map(normalizePhone),
    createdAt: new Date().toISOString(),
  };
  const groups = ensureSeeded();
  groups.unshift(group);
  write(GROUPS_KEY, groups);
  return group;
}

export async function updateGroup(id: string, patch: Partial<ChurchGroup>): Promise<ChurchGroup | null> {
  if (useBackend()) {
    return apiFetch<ChurchGroup>(`/api/groups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: patch.name,
        category: patch.category,
        campus: patch.campus,
        description: patch.description,
        leaderPhone: patch.leaderPhone,
        leaderName: patch.leaderName,
        memberPhones: patch.memberPhones,
        enableSongLibrary: patch.enableSongLibrary,
      }),
    });
  }

  const groups = ensureSeeded();
  const idx = groups.findIndex((g) => g.id === id);
  if (idx === -1) return null;
  groups[idx] = {
    ...groups[idx],
    ...patch,
    leaderPhone: patch.leaderPhone ? normalizePhone(patch.leaderPhone) : groups[idx].leaderPhone,
    memberPhones: patch.memberPhones?.map(normalizePhone) ?? groups[idx].memberPhones,
  };
  write(GROUPS_KEY, groups);
  return groups[idx];
}

export async function getBroadcasts(groupId: string): Promise<GroupBroadcast[]> {
  if (useBackend()) {
    return apiFetch<GroupBroadcast[]>(`/api/groups/${groupId}/items?type=broadcasts`);
  }
  return read<GroupBroadcast[]>(BROADCASTS_KEY, [])
    .filter((b) => b.groupId === groupId)
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
}

export async function createBroadcast(
  input: Omit<GroupBroadcast, 'id' | 'createdAt' | 'status'> & { status?: GroupBroadcast['status'] },
): Promise<GroupBroadcast> {
  if (useBackend()) {
    return apiFetch<GroupBroadcast>(`/api/groups/${input.groupId}/items`, {
      method: 'POST',
      body: JSON.stringify({
        message: input.message,
        scheduledAt: input.scheduledAt,
        status: input.status ?? 'scheduled',
        createdByPhone: input.createdByPhone,
      }),
    });
  }

  const all = read<GroupBroadcast[]>(BROADCASTS_KEY, []);
  const broadcast: GroupBroadcast = {
    ...input,
    id: `bc_${Date.now()}`,
    status: input.status ?? 'scheduled',
    createdAt: new Date().toISOString(),
  };
  all.unshift(broadcast);
  write(BROADCASTS_KEY, all);
  return broadcast;
}

export async function getSongs(groupId: string): Promise<GroupSong[]> {
  if (useBackend()) {
    return apiFetch<GroupSong[]>(`/api/groups/${groupId}/items?type=songs`);
  }
  return read<GroupSong[]>(SONGS_KEY, [])
    .filter((s) => s.groupId === groupId)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function formatSongChart(
  song: Pick<GroupSong, 'title' | 'key' | 'verse1' | 'verse2' | 'chorus' | 'bridge' | 'notes'>,
): string {
  return [
    `${song.title} — Key: ${song.key}`,
    '',
    'Verse 1',
    song.verse1,
    '',
    'Verse 2',
    song.verse2,
    '',
    'Chorus',
    song.chorus,
    song.bridge ? `\nBridge\n${song.bridge}` : '',
    song.notes ? `\nNote: ${song.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export async function saveSong(input: Omit<GroupSong, 'id' | 'createdAt' | 'sentAt'>): Promise<GroupSong> {
  if (useBackend()) {
    return apiFetch<GroupSong>(`/api/groups/${input.groupId}/items`, {
      method: 'POST',
      body: JSON.stringify({
        type: 'song',
        title: input.title,
        key: input.key,
        verse1: input.verse1,
        verse2: input.verse2,
        chorus: input.chorus,
        bridge: input.bridge,
        notes: input.notes,
      }),
    });
  }

  const all = read<GroupSong[]>(SONGS_KEY, []);
  const song: GroupSong = {
    ...input,
    id: `song_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  all.unshift(song);
  write(SONGS_KEY, all);
  return song;
}

export async function markSongSent(songId: string, groupId?: string): Promise<GroupSong | null> {
  if (useBackend() && groupId) {
    return apiFetch<GroupSong>(`/api/groups/${groupId}/items`, {
      method: 'PATCH',
      body: JSON.stringify({ songId, sentAt: new Date().toISOString() }),
    });
  }

  const all = read<GroupSong[]>(SONGS_KEY, []);
  const idx = all.findIndex((s) => s.id === songId);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], sentAt: new Date().toISOString() };
  write(SONGS_KEY, all);
  return all[idx];
}

export async function sendSongToBand(song: GroupSong, group: ChurchGroup): Promise<{ sent: number; demo: boolean }> {
  const { sendSms } = await import('@/lib/sms/service');
  const chart = formatSongChart(song);
  const message = `CKC Worship — ${song.title} (Key: ${song.key})\n\n${chart}`;
  let sent = 0;
  for (const phone of group.memberPhones) {
    await sendSms(phone, message);
    sent++;
  }
  await markSongSent(song.id, group.id);
  return { sent, demo: true };
}

export const DEMO_MEMBER_OPTIONS = [
  { phone: '735502016', name: 'David Khumalo' },
  { phone: '735502015', name: 'Pastor Sarah Ndlovu' },
  { phone: '735502014', name: 'James Mokoena' },
  { phone: '821112222', name: 'Thabo Mokoena' },
  { phone: '821113333', name: 'Nomsa Dlamini-Zulu' },
];

export async function getMemberOptions(): Promise<{ phone: string; name: string }[]> {
  if (useBackend()) {
    try {
      const members = await apiFetch<{ full_name: string; phone: string }[]>('/api/members');
      if (members.length > 0) {
        return members.map((m) => ({ phone: m.phone, name: m.full_name }));
      }
    } catch {
      /* fall through */
    }
  }
  return DEMO_MEMBER_OPTIONS;
}
