import { normalizePhone } from '@/lib/auth/session';
import { apiFetch, useBackend } from '@/lib/api/client';
import type { MembershipApplication } from '@/lib/membership/types';
import type { CampusId } from '@/lib/church/constants';
import { withChurchId } from '@/lib/church/tenant';

export interface SubmittedApplication {
  id: string;
  phone: string;
  campus: CampusId;
  status: string;
  applicationData: MembershipApplication;
  submittedAt: string | null;
  createdAt: string;
}

export async function submitMembershipApplication(input: {
  phone: string;
  campusId: CampusId;
  applicationData: MembershipApplication;
  inviteToken?: string;
  inviteId?: string;
}): Promise<SubmittedApplication> {
  if (useBackend()) {
    return apiFetch<SubmittedApplication>('/api/membership-applications', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  const payload: SubmittedApplication = {
    id: `app_${Date.now()}`,
    phone: normalizePhone(input.phone),
    campus: input.campusId,
    status: 'submitted',
    applicationData: input.applicationData,
    submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  const existing = JSON.parse(localStorage.getItem('ckc_submitted_applications') || '[]');
  localStorage.setItem('ckc_submitted_applications', JSON.stringify([payload, ...existing]));
  return payload;
}

export async function getSubmittedApplications(churchId?: string): Promise<SubmittedApplication[]> {
  if (useBackend()) {
    const params = withChurchId(new URLSearchParams({ status: 'submitted' }), churchId);
    return apiFetch<SubmittedApplication[]>(`/api/membership-applications?${params}`);
  }

  try {
    return JSON.parse(localStorage.getItem('ckc_submitted_applications') || '[]');
  } catch {
    return [];
  }
}

export async function reviewApplication(
  id: string,
  status: 'approved' | 'rejected',
  reviewNotes?: string,
): Promise<void> {
  if (useBackend()) {
    await apiFetch(`/api/membership-applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reviewNotes }),
    });
    return;
  }

  const apps: SubmittedApplication[] = JSON.parse(localStorage.getItem('ckc_submitted_applications') || '[]');
  const updated = apps.map((a) => (a.id === id ? { ...a, status } : a));
  localStorage.setItem('ckc_submitted_applications', JSON.stringify(updated));
}

export async function getMembershipApplication(
  phone: string,
  churchId?: string,
): Promise<MembershipApplication | null> {
  if (!useBackend() || !phone) return null;
  const params = withChurchId(new URLSearchParams({ phone }), churchId);
  return apiFetch<MembershipApplication | null>(`/api/membership-applications/by-phone?${params}`);
}
