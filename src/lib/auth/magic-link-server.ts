import { normalizeEmail } from '@/lib/auth/super-admin';

interface MagicLinkEntry {
  email: string;
  allowVisitor: boolean;
  expiresAt: number;
}

const globalForMagicLink = globalThis as typeof globalThis & {
  __ckcMagicLinkStore?: Map<string, MagicLinkEntry>;
};

function getStore(): Map<string, MagicLinkEntry> {
  if (!globalForMagicLink.__ckcMagicLinkStore) {
    globalForMagicLink.__ckcMagicLinkStore = new Map();
  }
  return globalForMagicLink.__ckcMagicLinkStore;
}

const LINK_TTL_MS = 30 * 60 * 1000;

function generateToken(): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export function issueMagicLink(email: string, allowVisitor: boolean): string {
  const normalized = normalizeEmail(email);
  const token = generateToken();
  getStore().set(token, {
    email: normalized,
    allowVisitor,
    expiresAt: Date.now() + LINK_TTL_MS,
  });
  return token;
}

export function consumeMagicLink(token: string): { email: string; allowVisitor: boolean } | null {
  const entry = getStore().get(token);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    getStore().delete(token);
    return null;
  }
  getStore().delete(token);
  return { email: entry.email, allowVisitor: entry.allowVisitor };
}
