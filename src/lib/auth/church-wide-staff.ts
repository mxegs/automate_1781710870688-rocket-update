import type { UserRole } from '@/lib/auth/session';

/** Church-wide staff roles (all campuses) — distinct from app developer super_admin. */
export const CHURCH_WIDE_DB_ROLES = ['senior_pastor', 'administrative_manager'] as const;

export type ChurchWideDbRole = (typeof CHURCH_WIDE_DB_ROLES)[number];

export const CHURCH_WIDE_APP_ROLES: UserRole[] = ['senior_pastor', 'administrative_manager'];

export function isChurchWideDbRole(role: string | undefined | null): role is ChurchWideDbRole {
  return CHURCH_WIDE_DB_ROLES.includes(role as ChurchWideDbRole);
}

export function isChurchWideAppRole(role: UserRole | undefined | null): boolean {
  return role === 'senior_pastor' || role === 'administrative_manager';
}

export function hasAllCampusAccess(options: {
  isSuperAdmin?: boolean;
  role?: UserRole;
  dbRole?: string | null;
}): boolean {
  if (options.isSuperAdmin) return true;
  if (isChurchWideAppRole(options.role ?? null)) return true;
  if (isChurchWideDbRole(options.dbRole)) return true;
  return false;
}

export function canManageTeam(session: {
  isSuperAdmin?: boolean;
  role?: UserRole;
} | null | undefined): boolean {
  if (!session) return false;
  return session.isSuperAdmin === true || isChurchWideAppRole(session.role ?? null);
}

export function churchWideRoleLabel(dbRole: string): string {
  if (dbRole === 'senior_pastor') return 'Senior Pastor';
  if (dbRole === 'administrative_manager') return 'Administrative Manager';
  return dbRole;
}
