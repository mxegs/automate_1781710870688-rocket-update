import { apiFetch, staffHeaders } from '@/lib/api/client';
import type { CampusId } from '@/lib/church/constants';
import type { BroadcastAudienceType } from '@/lib/broadcast/audience';

export interface BroadcastFilters {
  audienceType: BroadcastAudienceType;
  campusId?: CampusId | 'all';
  gender?: 'Male' | 'Female' | 'all';
  ageCategory?: 'child' | 'youth' | 'adult' | 'all';
  groupId?: string;
}

export interface BroadcastPreview {
  count: number;
  smsCount: number;
  emailCount: number;
  recipients: { id: string; name: string; phone: string; email: string | null; campus: string }[];
}

export async function previewBroadcast(filters: BroadcastFilters): Promise<BroadcastPreview> {
  return apiFetch('/api/broadcast/preview', {
    method: 'POST',
    headers: staffHeaders(),
    body: JSON.stringify(filters),
  });
}

export async function sendBroadcast(
  filters: BroadcastFilters & {
    channel: 'sms' | 'email';
    message: string;
    subject?: string;
  },
): Promise<{ channel: string; total: number; sent: number; failed?: number; demo?: boolean; campaignId?: string; warnings?: string[] }> {
  return apiFetch('/api/broadcast/send', {
    method: 'POST',
    headers: staffHeaders(),
    body: JSON.stringify(filters),
  });
}

export async function testMailchimp(): Promise<{
  ok: boolean;
  listName?: string;
  fromEmail?: string;
  doubleOptIn?: boolean;
  warning?: string;
  error?: string;
}> {
  return apiFetch('/api/broadcast/mailchimp/test', { headers: staffHeaders() });
}
