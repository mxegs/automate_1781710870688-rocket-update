import { apiFetch } from '@/lib/api/client';
import type { CampusId } from '@/lib/church/constants';
import type { BulkSmsResult } from '@/lib/sms/service';

export interface BulkSmsFilters {
  campusId?: CampusId | 'all';
  gender?: 'Male' | 'Female' | 'all';
  ageCategory?: 'child' | 'youth' | 'adult' | 'all';
  memberIds?: string[];
}

export async function previewBulkSms(filters: BulkSmsFilters): Promise<{
  count: number;
  recipients: { id: string; name: string; phone: string; campus: string }[];
}> {
  const params = new URLSearchParams();
  if (filters.campusId) params.set('campusId', filters.campusId);
  if (filters.gender) params.set('gender', filters.gender);
  if (filters.ageCategory) params.set('ageCategory', filters.ageCategory);
  return apiFetch(`/api/sms/bulk?${params}`);
}

export async function sendBulkSmsMessage(
  filters: BulkSmsFilters & { message: string },
): Promise<BulkSmsResult & { total: number }> {
  return apiFetch('/api/sms/bulk', {
    method: 'POST',
    body: JSON.stringify(filters),
  });
}
