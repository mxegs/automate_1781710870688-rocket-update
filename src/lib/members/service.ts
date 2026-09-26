import { apiFetch } from '@/lib/api/client';
import type { MembershipApplication } from '@/lib/membership/types';
import type { CampusId } from '@/lib/church/constants';
import { withChurchId } from '@/lib/church/tenant';

export type MemberDbStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface MemberDetail {
  id: string;
  fullName: string;
  surname: string;
  phone: string;
  email: string | null;
  campusId: CampusId;
  gender: string | null;
  age: number | null;
  status: MemberDbStatus;
  memberSince: string;
  applicationId: string | null;
  applicationData: MembershipApplication | null;
  submittedAt: string | null;
}

export async function getMembers(options?: {
  status?: MemberDbStatus;
  churchId?: string;
}): Promise<{ id: string; fullName: string; surname: string }[]> {
  const params = new URLSearchParams();
  if (options?.status) params.set('status', options.status);
  withChurchId(params, options?.churchId);
  const rows = await apiFetch<{ id: string; full_name: string | null; surname: string | null }[]>(
    `/api/members?${params}`,
  );
  return rows.map((row) => ({
    id: row.id,
    fullName: row.full_name?.trim() ?? '',
    surname: row.surname?.trim() ?? '',
  }));
}

export async function getMemberDetail(id: string, churchId?: string): Promise<MemberDetail> {
  const params = withChurchId(new URLSearchParams(), churchId);
  return apiFetch<MemberDetail>(`/api/members/${id}?${params}`);
}

export async function updateMemberAction(
  id: string,
  action: 'suspend' | 'reactivate' | 'terminate',
): Promise<{ ok: boolean }> {
  return apiFetch(`/api/members/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ action }),
  });
}
