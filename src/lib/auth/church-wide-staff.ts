import type { UserRole } from '@/lib/auth/session';
import { getPlatformRole } from '@/lib/auth/roles';

/** Church-wide staff roles (all campuses) — distinct from app developer super_admin. */
export const CHURCH_WIDE_DB_ROLES = ['senior_pastor', 'administrative_manager'] as const;

export type ChurchWideDbRole = (typeof CHURCH_WIDE_DB_ROLES)[number];

export const CHURCH_WIDE_APP_ROLES: UserRole[] = ['senior_pastor', 'administrative_manager'];

export function isChurchWideDbRole(role: string | undefined | null): role is ChurchWideDbRole {
  return getPlatformRole(role ?? '', false) === 'church_admin';
}

export function isChurchWideAppRole(role: UserRole | undefined | null): boolean {
  return getPlatformRole(role ?? '', false) === 'church_admin';
}

export function hasAllCampusAccess(options: {
  isSuperAdmin?: boolean;
  role?: UserRole;
  dbRole?: string | null;
}): boolean {
  const platformRole = getPlatformRole(options.dbRole || options.role || '', options.isSuperAdmin === true);
  return platformRole === 'platform_admin' || platformRole === 'church_admin';
}

export function canManageTeam(session: {
  isSuperAdmin?: boolean;
  role?: UserRole;
} | null | undefined): boolean {
  if (!session) return false;
  const platformRole = getPlatformRole(session.role ?? '', session.isSuperAdmin === true);
  return platformRole === 'platform_admin' || platformRole === 'church_admin';
}

export function churchWideRoleLabel(dbRole: string): string {
  if (dbRole === 'senior_pastor') return 'Senior Pastor';
  if (dbRole === 'administrative_manager') return 'Administrative Manager';
  return dbRole;
}
