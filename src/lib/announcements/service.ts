import { apiFetch, useBackend } from '@/lib/api/client';
import type { CampusId } from '@/lib/church/constants';
import type { Announcement, AnnouncementInput } from './types';

export async function getAdminAnnouncements(options: {
  campusId?: CampusId;
  allCampuses?: boolean;
}): Promise<Announcement[]> {
  if (!useBackend()) return [];
  const params = new URLSearchParams({ forAdmin: 'true' });
  if (options.allCampuses) params.set('allCampuses', 'true');
  else if (options.campusId) params.set('campusId', options.campusId);
  return apiFetch<Announcement[]>(`/api/announcements?${params}`);
}

export async function getMemberAnnouncements(options: {
  memberCampus?: CampusId;
  isVisitor?: boolean;
}): Promise<Announcement[]> {
  if (!useBackend()) return [];
  const params = new URLSearchParams();
  if (options.memberCampus) params.set('memberCampus', options.memberCampus);
  if (options.isVisitor) params.set('isVisitor', 'true');
  return apiFetch<Announcement[]>(`/api/announcements?${params}`);
}

export async function createAnnouncement(input: AnnouncementInput): Promise<Announcement> {
  return apiFetch<Announcement>('/api/announcements', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateAnnouncement(
  id: string,
  input: Partial<AnnouncementInput>,
): Promise<Announcement> {
  return apiFetch<Announcement>(`/api/announcements/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await apiFetch(`/api/announcements/${id}`, { method: 'DELETE' });
}
