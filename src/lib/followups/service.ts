import { apiFetch, useBackend } from '@/lib/api/client';
import type { CampusId, FollowUpStageId } from '@/lib/church/constants';

export interface FollowUpContact {
  id: string;
  name: string;
  phone: string;
  campus: CampusId;
  stage: FollowUpStageId;
  source: string;
  lastContact: string;
  assignedTo?: string;
}

export async function getFollowUps(options: {
  campusId?: CampusId;
  stage?: FollowUpStageId;
}): Promise<FollowUpContact[]> {
  if (!useBackend()) return [];
  const params = new URLSearchParams();
  if (options.campusId) params.set('campusId', options.campusId);
  if (options.stage) params.set('stage', options.stage);
  return apiFetch<FollowUpContact[]>(`/api/follow-ups?${params}`);
}

export async function updateFollowUpStage(
  id: string,
  stage: FollowUpStageId,
): Promise<FollowUpContact> {
  return apiFetch<FollowUpContact>(`/api/follow-ups/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ stage }),
  });
}

export async function sendFollowUpMessage(data: {
  contactIds: string[];
  channel: 'sms' | 'whatsapp' | 'newsletter';
  message: string;
}): Promise<{ sent: number }> {
  return apiFetch('/api/follow-ups/message', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
