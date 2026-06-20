import { apiFetch } from '@/lib/api/client';
import type { MembershipApplication } from '@/lib/membership/types';
import type { CampusId } from '@/lib/church/constants';

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

export async function getMemberDetail(id: string): Promise<MemberDetail> {
  return apiFetch<MemberDetail>(`/api/members/${id}`);
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
