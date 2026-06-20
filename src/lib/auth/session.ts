import { findDemoUser } from './demo-users';
import { apiFetch, useBackend } from '@/lib/api/client';

export type UserRole =
  | 'member'
  | 'visitor'
  | 'admin'
  | 'pastor'
  | 'leader'
  | 'senior_pastor'
  | 'administrative_manager';
export type ViewMode = 'staff' | 'member';

export interface AuthSession {
  phone: string;
  email?: string;
  role: UserRole;
  campusId?: string;
  isSuperAdmin?: boolean;
  dbRole?: string;
  /** Legal/full name from membership form */
  officialName?: string;
  /** Custom app username — how we greet them day-to-day */
  username?: string;
  /** Preferred short display name (defaults to username) */
  displayName?: string;
  inviteVerified?: boolean;
  /** Staff may browse the member portal without losing their role */
  viewMode?: ViewMode;
}

const SESSION_KEY = 'ckc_session';
const INVITE_KEY = 'ckc_invite_session';

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function formatPhoneDisplay(phone: string): string {
  const digits = normalizePhone(phone);
  if (digits.startsWith('27') && digits.length === 11) {
    return `+27 ${digits.slice(2, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  if (digits.length === 10 && digits.startsWith('0')) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return phone;
}

export function getDisplayName(session: AuthSession | null): string {
  if (!session) return 'Friend';
  return session.displayName || session.username || session.officialName || 'Friend';
}

export function isStaffRole(role: UserRole): boolean {
  return (
    role === 'admin' ||
    role === 'pastor' ||
    role === 'leader' ||
    role === 'senior_pastor' ||
    role === 'administrative_manager'
  );
}

/** Whether this phone may sign in as a member (demo users + pending invites). */
export async function isRegisteredMemberEmail(email: string): Promise<boolean> {
  const normalized = normalizeEmailValue(email);
  if (!normalized.includes('@')) return false;

  if (useBackend()) {
    try {
      const res = await apiFetch<{ registered: boolean }>(
        `/api/auth/check-email?email=${encodeURIComponent(normalized)}`,
      );
      return res.registered;
    } catch {
      return false;
    }
  }

  return false;
}

export async function fetchProfileByEmail(email: string): Promise<{
  email: string;
  phone: string;
  role: UserRole;
  dbRole?: string;
  isSuperAdmin?: boolean;
  officialName?: string;
  username?: string;
  displayName?: string;
  campusId?: string;
} | null> {
  if (!useBackend()) return null;
  return apiFetch<{
    email: string;
    phone: string;
    role: UserRole;
    dbRole?: string;
    isSuperAdmin?: boolean;
    officialName?: string;
    username?: string;
    displayName?: string;
    campusId?: string;
  } | null>(`/api/profiles/lookup-email?email=${encodeURIComponent(email)}`).catch(() => null);
}

export async function resolveSessionFromEmailAsync(
  email: string,
  options?: { asVisitor?: boolean },
): Promise<AuthSession> {
  const normalized = normalizeEmailValue(email);

  if (options?.asVisitor) {
    return {
      phone: '',
      email: normalized,
      role: 'visitor',
      displayName: normalized.split('@')[0] || 'Guest',
      username: 'guest',
    };
  }

  const profile = await fetchProfileByEmail(normalized);
  if (!profile) {
    throw new Error('Profile not found');
  }

  const session: AuthSession = {
    phone: profile.phone,
    email: normalized,
    role: profile.role,
    campusId: profile.campusId,
    isSuperAdmin: profile.isSuperAdmin,
    dbRole: profile.dbRole,
    officialName: profile.officialName,
    username: profile.username,
    displayName: profile.displayName,
  };
  if (isStaffRole(profile.role)) {
    session.viewMode = 'staff';
  }
  return session;
}

function normalizeEmailValue(email: string): string {
  return email.trim().toLowerCase();
}

export { normalizeEmailValue };

export async function fetchProfileForSession(session: AuthSession): Promise<Awaited<
  ReturnType<typeof fetchProfileByPhone>
> | null> {
  if (session.email) {
    return fetchProfileByEmail(session.email);
  }
  if (session.phone) {
    return fetchProfileByPhone(session.phone);
  }
  return null;
}

export async function fetchProfileByPhone(phone: string): Promise<{
  phone: string;
  role: UserRole;
  dbRole?: string;
  isSuperAdmin?: boolean;
  officialName?: string;
  username?: string;
  displayName?: string;
  campusId?: string;
} | null> {
  if (!useBackend()) return Promise.resolve(null);
  return apiFetch<{
    phone: string;
    role: UserRole;
    dbRole?: string;
    isSuperAdmin?: boolean;
    officialName?: string;
    username?: string;
    displayName?: string;
    campusId?: string;
  } | null>(`/api/profiles/lookup?phone=${encodeURIComponent(normalizePhone(phone))}`).catch(
    () => null,
  );
}

export async function resolveSessionFromPhoneAsync(
  phone: string,
  options?: { asVisitor?: boolean },
): Promise<AuthSession> {
  const normalized = normalizePhone(phone);

  if (options?.asVisitor) {
    return {
      phone: normalized,
      role: 'visitor',
      displayName: 'Guest',
      username: 'guest',
    };
  }

  const profile = await fetchProfileByPhone(normalized);
  if (profile) {
    const session: AuthSession = {
      phone: normalized,
      role: profile.role,
      campusId: profile.campusId,
      isSuperAdmin: profile.isSuperAdmin,
      dbRole: profile.dbRole,
      officialName: profile.officialName,
      username: profile.username,
      displayName: profile.displayName,
    };
    if (isStaffRole(profile.role)) {
      session.viewMode = 'staff';
    }
    return session;
  }

  return resolveSessionFromPhone(phone, options);
}

export function resolveSessionFromPhone(
  phone: string,
  options?: { asVisitor?: boolean },
): AuthSession {
  const normalized = normalizePhone(phone);

  if (options?.asVisitor) {
    return {
      phone: normalized,
      role: 'visitor',
      displayName: 'Guest',
      username: 'guest',
    };
  }

  const demo = findDemoUser(normalized);

  if (demo) {
    const session: AuthSession = {
      phone: normalized,
      role: demo.role,
      campusId: demo.campusId,
      officialName: demo.officialName,
      username: demo.username,
      displayName: demo.displayName,
    };
    if (isStaffRole(demo.role)) {
      session.viewMode = 'staff';
    }
    return session;
  }

  return {
    phone: normalized,
    role: 'member',
    displayName: 'Member',
  };
}

export function setSession(session: AuthSession): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  const legacyRole =
    session.role === 'member' || session.role === 'visitor'
      ? session.role
      : session.role === 'admin'
        ? 'super_admin'
        : session.role === 'senior_pastor'
          ? 'senior_pastor'
          : session.role === 'administrative_manager'
            ? 'administrative_manager'
            : session.role === 'pastor'
              ? 'pastor'
              : 'ministry_leader';
  sessionStorage.setItem('church_role', legacyRole);
  sessionStorage.setItem('church_user', getDisplayName(session));
}

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function setViewMode(mode: ViewMode): void {
  const session = getSession();
  if (!session || !isStaffRole(session.role)) return;
  setSession({ ...session, viewMode: mode });
}

export function getViewMode(session: AuthSession | null): ViewMode {
  if (!session || !isStaffRole(session.role)) return 'staff';
  return session.viewMode ?? 'staff';
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem('church_role');
  sessionStorage.removeItem('church_user');
}

export interface InviteSession {
  phone: string;
  email?: string;
  token: string;
  officialName?: string;
  givenName?: string;
  surname?: string;
  username?: string;
}

export function setInviteSession(data: InviteSession): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(INVITE_KEY, JSON.stringify({ ...data, verifiedAt: Date.now() }));
}

export function getInviteSession(): InviteSession | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(INVITE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return {
      phone: parsed.phone,
      email: parsed.email,
      token: parsed.token,
      officialName: parsed.officialName,
      givenName: parsed.givenName,
      surname: parsed.surname,
      username: parsed.username,
    };
  } catch {
    return null;
  }
}

export function clearInviteSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(INVITE_KEY);
}

export function getPostLoginRoute(role: UserRole, viewMode?: ViewMode): string {
  if (role === 'visitor') return '/visitor';
  if (viewMode === 'member') return '/member';
  if (role === 'member') return '/member';
  if (role === 'leader') return '/my-groups';
  return '/dashboard';
}

/** @deprecated use resolveSessionFromPhone */
export function resolveRoleFromPhone(phone: string): UserRole {
  return resolveSessionFromPhone(phone).role;
}
