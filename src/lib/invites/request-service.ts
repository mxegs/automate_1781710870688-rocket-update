import type { CampusId } from '@/lib/church/constants';
import { normalizePhone } from '@/lib/auth/session';

export type InviteRequestStatus = 'pending' | 'approved' | 'declined';

export interface InviteRequest {
  id: string;
  surname: string;
  fullName: string;
  phone: string;
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

export function getInviteRequests(status?: InviteRequestStatus): InviteRequest[] {
  const all = readRequests();
  if (!status) return all.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  return all.filter((r) => r.status === status).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
}

export function submitInviteRequest(input: {
  surname: string;
  fullName: string;
  phone: string;
  campus: CampusId;
}): InviteRequest {
  const normalized = normalizePhone(input.phone);
  const existing = readRequests().find(
    (r) => normalizePhone(r.phone) === normalized && r.status === 'pending',
  );
  if (existing) return existing;

  const request: InviteRequest = {
    id: `req_${Date.now()}`,
    surname: input.surname.trim(),
    fullName: input.fullName.trim(),
    phone: normalized,
    campus: input.campus,
    requestedAt: new Date().toISOString(),
    status: 'pending',
  };
  const requests = readRequests();
  requests.unshift(request);
  writeRequests(requests);
  return request;
}

export function updateInviteRequestStatus(
  id: string,
  status: InviteRequestStatus,
  notes?: string,
): InviteRequest | null {
  const requests = readRequests();
  const idx = requests.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  requests[idx] = { ...requests[idx], status, notes };
  writeRequests(requests);
  return requests[idx];
}
