export type PlatformRole =
  | 'platform_admin'
  | 'church_admin'
  | 'campus_admin'
  | 'group_leader'
  | 'member'
  | 'visitor';

export function getPlatformRole(dbRole: string, isSuperAdmin: boolean): PlatformRole {
  if (isSuperAdmin || dbRole === 'super_admin') return 'platform_admin';
  if (dbRole === 'senior_pastor' || dbRole === 'administrative_manager') {
    return 'church_admin';
  }
  if (dbRole === 'admin' || dbRole === 'pastor') return 'campus_admin';
  if (dbRole === 'leader') return 'group_leader';
  if (dbRole === 'member') return 'member';
  return 'visitor';
}
