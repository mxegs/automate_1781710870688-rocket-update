import { apiFetch, sessionHeaders, useBackend } from '@/lib/api/client';
import { withChurchId } from '@/lib/church/tenant';
import type { AssignStaffInput, StaffProfile } from './types';

export async function listStaffProfiles(churchId?: string): Promise<StaffProfile[]> {
  if (!useBackend()) return [];
  const params = withChurchId(new URLSearchParams(), churchId);
  return apiFetch<StaffProfile[]>(`/api/staff?${params}`, { headers: sessionHeaders() });
}

export async function assignStaffRole(input: AssignStaffInput): Promise<StaffProfile> {
  return apiFetch<StaffProfile>('/api/staff', {
    method: 'POST',
    headers: sessionHeaders(),
    body: JSON.stringify(input),
  });
}

export async function updateStaffRole(
  id: string,
  patch: Partial<Pick<AssignStaffInput, 'role' | 'campusId' | 'displayName'>>,
): Promise<StaffProfile> {
  return apiFetch<StaffProfile>(`/api/staff/${id}`, {
    method: 'PATCH',
    headers: sessionHeaders(),
    body: JSON.stringify(patch),
  });
}

export async function removeStaffRole(id: string): Promise<void> {
  await apiFetch(`/api/staff/${id}`, {
    method: 'DELETE',
    headers: sessionHeaders(),
  });
}
