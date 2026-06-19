import { DEMO_INVITES } from '@/lib/auth/demo-users';
import { normalizePhone } from '@/lib/auth/session';

export interface PendingInvite {
  id: string;
  token: string;
  phone: string;
  officialName: string;
  username?: string;
  sentAt: string;
  status: 'pending' | 'accepted';
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

export function getPendingInvites(): PendingInvite[] {
  return readInvites();
}

export function isPhoneInvited(phone: string): boolean {
  const normalized = normalizePhone(phone);
  const demoMatch = DEMO_INVITES.some((i) => normalizePhone(i.phone) === normalized);
  if (demoMatch) return true;
  return readInvites().some(
    (i) => normalizePhone(i.phone) === normalized && i.status === 'pending',
  );
}

export function findInviteByToken(token: string): PendingInvite | null {
  const demo = DEMO_INVITES.find((i) => i.token === token);
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
  phone: string;
  officialName: string;
  username?: string;
}

export function createInvite(input: CreateInviteInput): PendingInvite {
  const token = generateToken();
  const invite: PendingInvite = {
    id: `inv_${Date.now()}`,
    token,
    phone: normalizePhone(input.phone),
    officialName: input.officialName.trim(),
    username: input.username?.trim() || undefined,
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
