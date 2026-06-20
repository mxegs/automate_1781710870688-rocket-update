'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import {
  clearSession,
  getDisplayName,
  getPostLoginRoute,
  getSession,
  getViewMode,
  isStaffRole,
  setViewMode,
} from '@/lib/auth/session';
import { filterAdminNavForRole, getLeaderNavItems, getRoleLabel } from '@/lib/auth/permissions';
import { getGroupsLedBy } from '@/lib/groups/service';
import type { UserRole, ViewMode } from '@/lib/auth/session';
import { BRAND } from '@/lib/assets';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'HomeIcon' },
  { label: 'Members', href: '/members', icon: 'UsersIcon' },
  { label: 'Team & Roles', href: '/team', icon: 'ShieldCheckIcon' },
  { label: 'Visitors', href: '/visitors', icon: 'UserPlusIcon' },
  { label: 'Follow-Ups', href: '/follow-ups', icon: 'PhoneArrowUpRightIcon' },
  { label: 'Events', href: '/events', icon: 'CalendarDaysIcon' },
  { label: 'Sermons', href: '/sermons', icon: 'PlayCircleIcon' },
  { label: 'Prayer Requests', href: '/prayer-requests', icon: 'HeartIcon' },
  { label: 'Ministries', href: '/ministries', icon: 'BuildingLibraryIcon' },
  { label: 'Groups', href: '/groups', icon: 'UserGroupIcon' },
  { label: 'Broadcast', href: '/broadcast', icon: 'MegaphoneIcon' },
  { label: 'Pastoral Care', href: '/pastoral-care', icon: 'HandRaisedIcon' },
  { label: 'Announcements', href: '/announcements', icon: 'MegaphoneIcon' },
  { label: 'Reports', href: '/reports', icon: 'ChartBarIcon' },
];

const memberNavItems: NavItem[] = [
  { label: 'Home', href: '/member', icon: 'HomeIcon' },
  { label: 'Sermons & Messages', href: '/member/sermons', icon: 'PlayCircleIcon' },
  { label: 'Events', href: '/member/events', icon: 'CalendarDaysIcon' },
  { label: 'Announcements', href: '/member/announcements', icon: 'MegaphoneIcon' },
  { label: 'Submit Prayer', href: '/member/prayer', icon: 'HeartIcon' },
  { label: 'Bible Study', href: '/member/bible-study', icon: 'BookOpenIcon' },
  { label: 'Give', href: '/member/give', icon: 'GiftIcon' },
  { label: 'Church Info', href: '/member/church-info', icon: 'BuildingLibraryIcon' },
];

const visitorNavItems: NavItem[] = [
  { label: 'Home', href: '/visitor', icon: 'HomeIcon' },
  { label: 'Sermons', href: '/member/sermons', icon: 'PlayCircleIcon' },
  { label: 'Events', href: '/member/events', icon: 'CalendarDaysIcon' },
  { label: 'Church Info', href: '/member/church-info', icon: 'BuildingLibraryIcon' },
  { label: 'Daily Word', href: '/member/bible-study', icon: 'BookOpenIcon' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [displayName, setDisplayName] = useState('User');
  const [userRole, setUserRole] = useState<UserRole>('member');
  const [viewMode, setViewModeState] = useState<ViewMode>('staff');

  const [leadsGroups, setLeadsGroups] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session) {
      setUserRole(session.role);
      setDisplayName(getDisplayName(session));
      setViewModeState(getViewMode(session));
      setIsSuperAdmin(session.isSuperAdmin === true);
      getGroupsLedBy(session.phone).then((led) => setLeadsGroups(led.length > 0));
    }
  }, [pathname]);

  const isMember = userRole === 'member';
  const isVisitor = userRole === 'visitor';
  const isStaff = isStaffRole(userRole);
  const staffBrowsingAsMember = isStaff && viewMode === 'member';

  const isLeader = userRole === 'leader';

  const navItems = isVisitor
    ? visitorNavItems
    : isMember || staffBrowsingAsMember
      ? leadsGroups || isLeader
        ? [{ label: 'My Groups', href: '/my-groups', icon: 'UserGroupIcon' }, ...memberNavItems]
        : memberNavItems
      : isLeader
        ? getLeaderNavItems()
        : filterAdminNavForRole(adminNavItems, userRole, isSuperAdmin);

  const portalBadge = isVisitor
    ? 'Visitor Access'
    : staffBrowsingAsMember
      ? 'Member View'
      : isMember
        ? 'Member Portal'
        : getRoleLabel(userRole);

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  const toggleViewMode = () => {
    const next: ViewMode = viewMode === 'staff' ? 'member' : 'staff';
    setViewMode(next);
    setViewModeState(next);
    router.push(getPostLoginRoute(userRole, next));
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const active =
      pathname === item.href ||
      (item.href !== '/member' &&
        item.href !== '/dashboard' &&
        item.href !== '/visitor' &&
        pathname.startsWith(item.href));
    return (
      <Link
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
          active
            ? 'bg-ckc-gold/10 text-ckc-gold border border-ckc-gold/20'
            : 'text-cloud/60 hover:text-cloud hover:bg-white/5'
        }`}
      >
        <Icon
          name={item.icon}
          size={18}
          variant="outline"
          className={active ? 'text-ckc-gold' : 'text-cloud/50 group-hover:text-cloud/80'}
        />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  const UserFooter = ({ showText }: { showText: boolean }) => (
    <div className={`flex items-center gap-3 px-2 py-2 ${!showText ? 'justify-center' : ''}`}>
      <div className="w-8 h-8 rounded-full bg-ckc-gold/20 flex items-center justify-center flex-shrink-0">
        <Icon name="UserCircleIcon" size={18} variant="outline" className="text-ckc-gold" />
      </div>
      {showText && (
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-cloud truncate">{displayName}</p>
          <p className="text-xs text-cloud/40 truncate">{portalBadge}</p>
        </div>
      )}
    </div>
  );

  const ViewModeToggle = ({ showText }: { showText: boolean }) => {
    if (!isStaff) return null;
    return (
      <button
        onClick={toggleViewMode}
        className={`mt-2 flex items-center gap-2 rounded-lg border border-ckc-gold/20 bg-ckc-gold/5 px-3 py-2 text-xs text-ckc-gold hover:bg-ckc-gold/10 transition-colors ${
          !showText ? 'justify-center w-full' : 'w-full'
        }`}
      >
        <Icon name="ArrowsRightLeftIcon" size={14} variant="outline" />
        {showText && (viewMode === 'staff' ? 'See Church Life' : 'Leadership Desk')}
      </button>
    );
  };

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-slate-dark border-b border-white/10">
        <AppLogo size={24} text={BRAND.abbreviation} className="text-cloud font-bold text-base tracking-tight" />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-cloud/70 hover:text-cloud p-1"
          aria-label="Toggle menu"
        >
          <Icon name={mobileOpen ? 'XMarkIcon' : 'Bars3Icon'} size={22} variant="outline" />
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      <div
        className={`md:hidden fixed top-0 left-0 h-full z-50 w-64 bg-slate-dark border-r border-white/10 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <AppLogo size={24} text={BRAND.abbreviation} className="text-cloud font-bold text-base tracking-tight" />
          <button onClick={() => setMobileOpen(false)} className="text-cloud/50 hover:text-cloud">
            <Icon name="XMarkIcon" size={20} variant="outline" />
          </button>
        </div>
        {!collapsed && (
          <div className="px-4 py-2 border-b border-white/5">
            <span className="text-xs text-ckc-gold font-medium">{portalBadge}</span>
          </div>
        )}
        <nav className="p-3 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10">
          <UserFooter showText={true} />
          <ViewModeToggle showText={true} />
          <Link
            href="/account/change-password"
            className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-cloud/40 hover:text-ckc-gold hover:bg-ckc-gold/5 transition-colors"
          >
            <Icon name="KeyIcon" size={14} variant="outline" />
            <span>Change password</span>
          </Link>
          <button
            onClick={handleLogout}
            className="mt-1 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-cloud/40 hover:text-rose-400 hover:bg-rose-500/5 transition-colors"
          >
            <Icon name="ArrowLeftOnRectangleIcon" size={14} variant="outline" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <aside
        className={`hidden md:flex flex-col fixed top-0 left-0 h-full z-30 bg-slate-dark border-r border-white/10 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
          {!collapsed && (
            <AppLogo size={24} text={BRAND.abbreviation} className="text-cloud font-bold text-sm tracking-tight" />
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`text-cloud/40 hover:text-cloud transition-colors ${collapsed ? 'mx-auto' : ''}`}
            aria-label="Toggle sidebar"
          >
            <Icon name={collapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon'} size={16} variant="outline" />
          </button>
        </div>

        {!collapsed && (
          <div className="px-4 py-2 border-b border-white/5">
            <span className="text-xs text-ckc-gold font-medium">{portalBadge}</span>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <UserFooter showText={!collapsed} />
          <ViewModeToggle showText={!collapsed} />
          {!collapsed && (
            <Link
              href="/account/change-password"
              className="mt-1 w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-cloud/40 hover:text-ckc-gold hover:bg-ckc-gold/5 transition-colors"
            >
              <Icon name="KeyIcon" size={13} variant="outline" />
              <span>Change password</span>
            </Link>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="mt-1 w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-cloud/40 hover:text-rose-400 hover:bg-rose-500/5 transition-colors"
            >
              <Icon name="ArrowLeftOnRectangleIcon" size={13} variant="outline" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
