import { rememberChurchSlug, readLastChurchSlug } from '@/lib/church/last-slug';

export interface ResolvedChurch {
  id: string;
  name: string;
  slug: string;
  primaryColor: string | null;
  secondaryColor: string | null;
  logoUrl: string | null;
  appName: string | null;
}

const RESERVED = new Set([
  'login',
  'signup',
  'invite',
  'member',
  'rsvp',
  'api',
  'dashboard',
  'events',
  'sermons',
  'announcements',
  'prayer-requests',
  'groups',
  'my-groups',
  'follow-ups',
  'broadcast',
  'team',
  'reports',
  'account',
  'forgot-password',
  'reset-password',
  'request-invite',
  'ministries',
  'pastoral-care',
  'visitors',
  'visitor',
  'members',
  'membership-settings',
  'small-groups',
  'home',
  'assets',
  '_next',
]);

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

export function extractChurchSlug(pathname: string): string | null {
  const segment = pathname.split('/').filter(Boolean)[0] ?? '';
  if (!segment || RESERVED.has(segment.toLowerCase())) return null;
  if (!SLUG_PATTERN.test(segment)) return null;
  return segment.toLowerCase();
}

export function inviteTokenFromPath(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] !== 'invite' || !parts[1]) return null;
  return decodeURIComponent(parts[1]);
}

export async function getChurchBySlug(slug: string): Promise<ResolvedChurch | null> {
  const res = await fetch(`/api/churches/by-slug/${encodeURIComponent(slug)}`);
  if (!res.ok) return null;
  return res.json() as Promise<ResolvedChurch>;
}

async function churchFromInviteToken(token: string): Promise<ResolvedChurch | null> {
  const res = await fetch(`/api/invites/token/${encodeURIComponent(token)}`);
  if (!res.ok) return null;
  const invite = (await res.json()) as { churchSlug?: string | null };
  if (!invite.churchSlug) return null;
  return getChurchBySlug(invite.churchSlug);
}

export async function resolveCurrentChurch(): Promise<ResolvedChurch | null> {
  if (typeof window === 'undefined') return null;
  const pathname = window.location.pathname;

  const urlSlug = extractChurchSlug(pathname);
  if (urlSlug) {
    const church = await getChurchBySlug(urlSlug);
    if (church) {
      rememberChurchSlug(church.slug);
      return church;
    }
  }

  const stored = readLastChurchSlug();
  if (stored && stored !== urlSlug) {
    const church = await getChurchBySlug(stored);
    if (church) return church;
  }

  const token = inviteTokenFromPath(pathname);
  if (token) {
    const church = await churchFromInviteToken(token);
    if (church) {
      rememberChurchSlug(church.slug);
      return church;
    }
  }

  return null;
}
