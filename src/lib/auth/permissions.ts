import type { UserRole, ViewMode } from './session';
import { isStaffRole } from './session';

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

const LEADER_RESTRICTED = ['/reports', '/members', '/visitors', '/follow-ups', '/announcements'];

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
): boolean {
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/request-invite') ||
    pathname.startsWith('/invite') ||
    pathname.startsWith('/signup') ||
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

  if (role === 'pastor' || role === 'admin') {
    return isAdminRoute(pathname) || isLeaderRoute(pathname);
  }

  return false;
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: 'Administrator',
    pastor: 'Pastor',
    leader: 'Group Leader',
    member: 'Member',
    visitor: 'Visitor',
  };
  return labels[role];
}

export function filterAdminNavForRole(
  items: { href: string; label: string; icon: string }[],
  role: UserRole,
) {
  if (role === 'leader') {
    return items.filter(
      (item) =>
        !LEADER_RESTRICTED.includes(item.href) &&
        item.href !== '/dashboard' &&
        item.href !== '/groups',
    );
  }
  return items;
}

export function getLeaderNavItems(): { href: string; label: string; icon: string }[] {
  return [
    { label: 'My Groups', href: '/my-groups', icon: 'UserGroupIcon' },
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
