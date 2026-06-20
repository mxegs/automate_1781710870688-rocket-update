import { DEMO_INVITES } from '@/lib/auth/demo-users';
import { apiFetch, staffHeaders, useBackend } from '@/lib/api/client';

export interface PendingInvite {
  id: string;
  token: string;
  phone: string;
  email?: string;
  officialName: string;
  givenName?: string;
  surname?: string;
  username?: string;
  sentAt: string;
  status: 'pending' | 'accepted';
  inviteUrl?: string;
  sms?: {
    success: boolean;
    demo?: boolean;
    error?: string;
  };
  emailDelivery?: {
    success: boolean;
    demo?: boolean;
    error?: string;
  };
}

const INVITES_KEY = 'ckc_pending_invites';

function readInvites(): PendingInvite[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(INVITES_KEY) || '[]') as PendingInvite[];
  } catch {
    return [];
  }
}

function writeInvites(invites: PendingInvite[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(INVITES_KEY, JSON.stringify(invites));
}

function generateToken(): string {
  return Math.random().toString(36).slice(2, 10);
}

export async function getPendingInvites(): Promise<PendingInvite[]> {
  return readInvites();
}

export async function findInviteByToken(token: string): Promise<PendingInvite | null> {
  const demo = DEMO_INVITES.find((i) => i.token === token);
  if (demo && !useBackend()) {
    return {
      id: `demo-${token}`,
      token: demo.token,
      phone: demo.phone,
      officialName: demo.officialName,
      username: demo.username,
      sentAt: new Date().toISOString(),
      status: 'pending',
    };
  }

  if (useBackend()) {
    try {
      return await apiFetch<PendingInvite>(`/api/invites/token/${encodeURIComponent(token)}`);
    } catch {
      if (demo) {
        return {
          id: `demo-${token}`,
          token: demo.token,
          phone: demo.phone,
          officialName: demo.officialName,
          username: demo.username,
          sentAt: new Date().toISOString(),
          status: 'pending',
        };
      }
      return null;
    }
  }

  if (demo) {
    return {
      id: `demo-${token}`,
      token: demo.token,
      phone: demo.phone,
      officialName: demo.officialName,
      username: demo.username,
      sentAt: new Date().toISOString(),
      status: 'pending',
    };
  }

  return readInvites().find((i) => i.token === token && i.status === 'pending') ?? null;
}

export interface CreateInviteInput {
  email: string;
  givenName: string;
  surname: string;
  officialName?: string;
  phone?: string;
  campusId?: string;
  inviteRequestId?: string;
}

export async function createInvite(input: CreateInviteInput): Promise<PendingInvite> {
  if (useBackend()) {
    return apiFetch<PendingInvite>('/api/invites', {
      method: 'POST',
      headers: staffHeaders(),
      body: JSON.stringify(input),
    });
  }

  const token = generateToken();
  const officialName = input.officialName?.trim() || `${input.givenName} ${input.surname}`.trim();
  const invite: PendingInvite = {
    id: `inv_${Date.now()}`,
    token,
    phone: input.phone ?? '',
    email: input.email.trim().toLowerCase(),
    officialName,
    givenName: input.givenName.trim(),
    surname: input.surname.trim(),
    sentAt: new Date().toISOString(),
    status: 'pending',
  };
  const invites = readInvites();
  invites.unshift(invite);
  writeInvites(invites);
  return invite;
}

export function getInviteUrl(token: string): string {
  if (typeof window === 'undefined') return `/invite/${token}`;
  return `${window.location.origin}/invite/${token}`;
}
