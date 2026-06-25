import type { UserRole, ViewMode } from './session';
import { isStaffRole } from './session';
import { canManageTeam, isChurchWideAppRole } from './church-wide-staff';

const ADMIN_ROUTES = [
  '/dashboard',
  '/members',
  '/visitors',
  '/follow-ups',
  '/events',
  '/sermons',
  '/prayer-requests',
  '/ministries',
  '/groups',
  '/broadcast',
  '/small-groups',
  '/pastoral-care',
  '/announcements',
  '/reports',
];

/** Routes for group/ministry leaders (assigned by admin) */
const LEADER_ROUTES = ['/my-groups'];

const MEMBER_ROUTES = ['/member'];

const VISITOR_ALLOWED = [
  '/visitor',
  '/member/sermons',
  '/member/events',
  '/member/church-info',
  '/member/bible-study',
];

const LEADER_RESTRICTED = ['/reports', '/members', '/visitors', '/follow-ups', '/announcements', '/team'];

/** App developer (super admin) — not a church member; must not send/receive broadcasts. */
const SUPER_ADMIN_BLOCKED = ['/broadcast'];

const TEAM_ROUTES = ['/team'];

export function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

export function isLeaderRoute(pathname: string): boolean {
  return LEADER_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

export function isMemberRoute(pathname: string): boolean {
  return MEMBER_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

export function canAccessRoute(
  role: UserRole,
  pathname: string,
  viewMode: ViewMode = 'staff',
  isSuperAdmin?: boolean,
): boolean {
  if (TEAM_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`))) {
    return canManageTeam({ isSuperAdmin, role });
  }

  if (
    isSuperAdmin &&
    SUPER_ADMIN_BLOCKED.some((r) => pathname === r || pathname.startsWith(`${r}/`))
  ) {
    return false;
  }

  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/account/set-password') ||
    pathname.startsWith('/request-invite') ||
    pathname.startsWith('/invite') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/rsvp') ||
    pathname.startsWith('/visitor/login')
  ) {
    return true;
  }

  if (isStaffRole(role) && viewMode === 'member') {
    if (role === 'leader') {
      return isMemberRoute(pathname) || isLeaderRoute(pathname);
    }
    return isMemberRoute(pathname);
  }

  if (role === 'visitor') {
    return VISITOR_ALLOWED.some((r) => pathname === r || pathname.startsWith(`${r}/`));
  }

  if (role === 'member') {
    if (isLeaderRoute(pathname)) return true;
    return isMemberRoute(pathname);
  }

  if (role === 'leader') {
    if (isLeaderRoute(pathname)) return true;
    if (LEADER_RESTRICTED.some((r) => pathname === r || pathname.startsWith(`${r}/`))) {
      return false;
    }
    return isAdminRoute(pathname);
  }

  if (
    role === 'pastor' ||
    role === 'admin' ||
    role === 'senior_pastor' ||
    role === 'administrative_manager'
  ) {
    return isAdminRoute(pathname) || isLeaderRoute(pathname);
  }

  return false;
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: 'Campus Administrator',
    pastor: 'Campus Pastor',
    senior_pastor: 'Senior Pastor',
    administrative_manager: 'Administrative Manager',
    leader: 'Group Leader',
    member: 'Member',
    visitor: 'Visitor',
  };
  return labels[role];
}

export function filterAdminNavForRole(
  items: { href: string; label: string; icon: string }[],
  role: UserRole,
  isSuperAdmin?: boolean,
) {
  let filtered = items;
  if (!canManageTeam({ isSuperAdmin, role })) {
    filtered = filtered.filter((item) => item.href !== '/team');
  }
  if (role === 'leader') {
    return filtered.filter(
      (item) =>
        !LEADER_RESTRICTED.includes(item.href) &&
        item.href !== '/dashboard' &&
        item.href !== '/groups',
    );
  }
  // Super admin (app developer) — no broadcast; church staff use it for SMS/email
  if (isSuperAdmin) {
    filtered = filtered.filter((item) => item.href !== '/broadcast');
  }
  // Campus admin / pastor — hide reports only; church-wide roles keep full menu
  if ((role === 'admin' && !isSuperAdmin) || role === 'pastor') {
    filtered = filtered.filter((item) => item.href !== '/reports');
  }
  return filtered;
}

export function getLeaderNavItems(): { href: string; label: string; icon: string }[] {
  return [
    { label: 'My Groups', href: '/my-groups', icon: 'UserGroupIcon' },
    { label: 'Broadcast', href: '/broadcast', icon: 'MegaphoneIcon' },
    { label: 'Events', href: '/events', icon: 'CalendarDaysIcon' },
    { label: 'Prayer Requests', href: '/prayer-requests', icon: 'HeartIcon' },
  ];
}

export function getGroupManagerNavItems(): { href: string; label: string; icon: string }[] {
  return [
    { label: 'Dashboard', href: '/dashboard', icon: 'HomeIcon' },
    { label: 'Members', href: '/members', icon: 'UsersIcon' },
    { label: 'Groups', href: '/groups', icon: 'UserGroupIcon' },
    { label: 'Ministries', href: '/ministries', icon: 'BuildingLibraryIcon' },
    { label: 'Events', href: '/events', icon: 'CalendarDaysIcon' },
    { label: 'Announcements', href: '/announcements', icon: 'MegaphoneIcon' },
    { label: 'Reports', href: '/reports', icon: 'ChartBarIcon' },
  ];
}

export { isChurchWideAppRole };
