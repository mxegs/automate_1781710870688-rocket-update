import type { CampusId } from '@/lib/church/constants';
import { apiFetch, staffHeaders, useBackend } from '@/lib/api/client';

export type InviteRequestStatus = 'pending' | 'approved' | 'declined';

export interface InviteRequest {
  id: string;
  surname: string;
  fullName: string;
  phone?: string;
  email: string;
  campus: CampusId;
  requestedAt: string;
  status: InviteRequestStatus;
  notes?: string;
}

const REQUESTS_KEY = 'ckc_invite_requests';

function readRequests(): InviteRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(REQUESTS_KEY) || '[]') as InviteRequest[];
  } catch {
    return [];
  }
}

function writeRequests(requests: InviteRequest[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
}

export async function getInviteRequests(status?: InviteRequestStatus): Promise<InviteRequest[]> {
  if (useBackend()) {
    const qs = status ? `?status=${status}` : '';
    return apiFetch<InviteRequest[]>(`/api/invite-requests${qs}`, { headers: staffHeaders() });
  }

  const all = readRequests();
  if (!status) return all.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  return all.filter((r) => r.status === status).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
}

export async function submitInviteRequest(input: {
  surname: string;
  fullName: string;
  email: string;
  campus: CampusId;
}): Promise<InviteRequest> {
  if (useBackend()) {
    return apiFetch<InviteRequest>('/api/invite-requests', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  const normalizedEmail = input.email.trim().toLowerCase();
  const existing = readRequests().find(
    (r) => r.email?.toLowerCase() === normalizedEmail && r.status === 'pending',
  );
  if (existing) return existing;

  const request: InviteRequest = {
    id: `req_${Date.now()}`,
    surname: input.surname.trim(),
    fullName: input.fullName.trim(),
    email: normalizedEmail,
    campus: input.campus,
    requestedAt: new Date().toISOString(),
    status: 'pending',
  };
  const requests = readRequests();
  requests.unshift(request);
  writeRequests(requests);
  return request;
}

export async function updateInviteRequestStatus(
  id: string,
  status: InviteRequestStatus,
  notes?: string,
): Promise<InviteRequest | null> {
  if (useBackend()) {
    return apiFetch<InviteRequest>(`/api/invite-requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  const requests = readRequests();
  const idx = requests.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  requests[idx] = { ...requests[idx], status, notes };
  writeRequests(requests);
  return requests[idx];
}
