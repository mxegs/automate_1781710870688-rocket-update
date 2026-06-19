'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles?: string[];
  section?: string;
}

// Admin/staff nav items
const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'HomeIcon' },
  { label: 'Members', href: '/members', icon: 'UsersIcon' },
  { label: 'Visitors', href: '/visitors', icon: 'UserPlusIcon' },
  { label: 'Events', href: '/events', icon: 'CalendarDaysIcon' },
  { label: 'Sermons', href: '/sermons', icon: 'PlayCircleIcon' },
  { label: 'Prayer Requests', href: '/prayer-requests', icon: 'HeartIcon' },
  { label: 'Ministries', href: '/ministries', icon: 'BuildingLibraryIcon' },
  { label: 'Small Groups', href: '/small-groups', icon: 'UserGroupIcon' },
  { label: 'Pastoral Care', href: '/pastoral-care', icon: 'HandRaisedIcon' },
  { label: 'Announcements', href: '/announcements', icon: 'MegaphoneIcon' },
  { label: 'Reports', href: '/reports', icon: 'ChartBarIcon' },
];

// Member portal nav items
const memberNavItems: NavItem[] = [
  { label: 'Home', href: '/member', icon: 'HomeIcon' },
  { label: 'Sermons & Messages', href: '/member/sermons', icon: 'PlayCircleIcon' },
  { label: 'Events', href: '/member/events', icon: 'CalendarDaysIcon' },
  { label: 'Announcements', href: '/member/announcements', icon: 'MegaphoneIcon' },
  { label: 'Prayer Requests', href: '/member/prayer', icon: 'HeartIcon' },
  { label: 'Bible Study', href: '/member/bible-study', icon: 'BookOpenIcon' },
  { label: 'Give', href: '/member/give', icon: 'GiftIcon' },
  { label: 'Church Info', href: '/member/church-info', icon: 'BuildingLibraryIcon' },
];

const roleLabels: Record<string, string> = {
  super_admin: 'Super Administrator',
  pastor: 'Pastor',
  ministry_leader: 'Ministry Leader',
  prayer_team: 'Prayer Team',
  member: 'Church Member',
};

const memberRoles = ['member'];
const adminRoles = ['super_admin', 'pastor', 'ministry_leader', 'prayer_team'];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userRole, setUserRole] = useState('super_admin');
  const [userEmail, setUserEmail] = useState('admin@church.org');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = sessionStorage.getItem('church_role') || 'super_admin';
      const email = sessionStorage.getItem('church_user') || 'admin@church.org';
      setUserRole(role);
      setUserEmail(email);
    }
  }, []);

  const isMember = memberRoles.includes(userRole);
  const navItems = isMember ? memberNavItems : adminNavItems;

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('church_role');
      sessionStorage.removeItem('church_user');
    }
    router.push('/login');
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = pathname === item.href || (item.href !== '/member' && item.href !== '/dashboard' && pathname.startsWith(item.href));
    return (
      <Link
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
          active
            ? 'bg-sky/10 text-sky border border-sky/20' :'text-cloud/60 hover:text-cloud hover:bg-white/5'
        }`}
      >
        <Icon
          name={item.icon}
          size={18}
          variant="outline"
          className={active ? 'text-sky' : 'text-cloud/50 group-hover:text-cloud/80'}
        />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  const UserFooter = ({ showText }: { showText: boolean }) => (
    <div className={`flex items-center gap-3 px-2 py-2 ${!showText ? 'justify-center' : ''}`}>
      <div className="w-8 h-8 rounded-full bg-sky/20 flex items-center justify-center flex-shrink-0">
        <Icon name="UserCircleIcon" size={18} variant="outline" className="text-sky" />
      </div>
      {showText && (
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-cloud truncate">{userEmail}</p>
          <p className="text-xs text-cloud/40 truncate">{roleLabels[userRole] || 'User'}</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-slate-dark border-b border-white/10">
        <AppLogo size={24} text="Church Connect" className="text-cloud font-bold text-base tracking-tight" />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-cloud/70 hover:text-cloud p-1"
          aria-label="Toggle menu"
        >
          <Icon name={mobileOpen ? 'XMarkIcon' : 'Bars3Icon'} size={22} variant="outline" />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full z-50 w-64 bg-slate-dark border-r border-white/10 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <AppLogo size={24} text="Church Connect" className="text-cloud font-bold text-base tracking-tight" />
          <button onClick={() => setMobileOpen(false)} className="text-cloud/50 hover:text-cloud">
            <Icon name="XMarkIcon" size={20} variant="outline" />
          </button>
        </div>
        {isMember && (
          <div className="px-4 py-2 border-b border-white/5">
            <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
              <Icon name="UserCircleIcon" size={11} variant="outline" />
              Member Portal
            </span>
          </div>
        )}
        <nav className="p-3 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10">
          <UserFooter showText={true} />
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-cloud/40 hover:text-rose-400 hover:bg-rose-500/5 transition-colors"
          >
            <Icon name="ArrowLeftOnRectangleIcon" size={14} variant="outline" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed top-0 left-0 h-full z-30 bg-slate-dark border-r border-white/10 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
          {!collapsed && (
            <AppLogo size={24} text="Church Connect" className="text-cloud font-bold text-sm tracking-tight" />
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`text-cloud/40 hover:text-cloud transition-colors ${collapsed ? 'mx-auto' : ''}`}
            aria-label="Toggle sidebar"
          >
            <Icon name={collapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon'} size={16} variant="outline" />
          </button>
        </div>

        {/* Member portal badge */}
        {isMember && !collapsed && (
          <div className="px-4 py-2 border-b border-white/5">
            <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
              <Icon name="UserCircleIcon" size={11} variant="outline" />
              Member Portal
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-white/10">
          <UserFooter showText={!collapsed} />
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
