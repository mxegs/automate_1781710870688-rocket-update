import { apiFetch, useBackend } from '@/lib/api/client';
import type { CampusId } from '@/lib/church/constants';
import type { PrayerRequest, PrayerRequestInput, PrayerStatus } from './types';

export async function submitPrayerRequest(
  input: PrayerRequestInput,
): Promise<{ request: PrayerRequest; autoReply: string }> {
  return apiFetch('/api/prayer-requests', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getAdminPrayerRequests(options: {
  campusId?: CampusId;
  allCampuses?: boolean;
}): Promise<PrayerRequest[]> {
  if (!useBackend()) return [];
  const params = new URLSearchParams();
  if (options.allCampuses) params.set('allCampuses', 'true');
  else if (options.campusId) params.set('campusId', options.campusId);
  return apiFetch<PrayerRequest[]>(`/api/prayer-requests?${params}`);
}

export async function updatePrayerStatus(
  id: string,
  status: PrayerStatus,
): Promise<PrayerRequest> {
  return apiFetch<PrayerRequest>(`/api/prayer-requests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
