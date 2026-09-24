'use client';

import React from 'react';
import Link from 'next/link';
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
import type { ChurchLifeNavItem } from '@/lib/church-life/nav';
import type { ViewMode } from '@/lib/auth/session';
import { usePathname, useRouter } from 'next/navigation';

interface ChurchLifeNavDrawerProps {
  open: boolean;
  onClose: () => void;
  navItems: ChurchLifeNavItem[];
  portalLabel: string;
}

export default function ChurchLifeNavDrawer({
  open,
  onClose,
  navItems,
  portalLabel,
}: ChurchLifeNavDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const session = getSession();
  const displayName = session ? getDisplayName(session) : 'Guest';
  const isStaff = session ? isStaffRole(session.role) : false;
  const viewMode = session ? getViewMode(session) : 'member';

  if (!open) return null;

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  const toggleViewMode = () => {
    if (!session) return;
    const next: ViewMode = viewMode === 'staff' ? 'member' : 'staff';
    setViewMode(next);
    onClose();
    router.push(getPostLoginRoute(session.role, next));
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} aria-hidden />
      <aside className="fixed inset-y-0 left-0 z-50 w-[260px] max-w-[85vw] bg-white shadow-ckc-lg">
        <div className="flex items-center justify-between px-4 py-5">
          <div>
            <p className="font-serif text-base font-semibold text-ckc-black">Welcome, {displayName}</p>
            <p className="text-[11px] text-ckc-muted">Christ Kingdom Citizens</p>
            <p className="mt-0.5 text-[10px] text-ckc-gold">{portalLabel}</p>
          </div>
          <button type="button" onClick={onClose} className="text-ckc-muted hover:text-ckc-black" aria-label="Close menu">
            <Icon name="XMarkIcon" size={16} variant="outline" />
          </button>
        </div>

        <nav className="space-y-0.5 overflow-y-auto px-2" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/member' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-full px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? 'bg-ckc-gold text-ckc-gold-text font-medium'
                    : 'text-ckc-black hover:bg-black/[0.04]'
                }`}
              >
                <Icon
                  name={item.icon}
                  size={16}
                  variant="outline"
                  className={active ? 'text-ckc-gold-text' : 'text-ckc-muted'}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 space-y-1 border-t border-[#E5E5E5] bg-white p-3">
          {isStaff && (
            <button
              type="button"
              onClick={toggleViewMode}
              className="w-full rounded-lg border border-ckc-gold/30 py-2 text-center text-[11px] font-medium text-ckc-gold"
            >
              {viewMode === 'staff' ? 'See Church Life' : 'Leadership desk'}
            </button>
          )}
          {session ? (
            <>
              <Link
                href="/account/change-password"
                onClick={onClose}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-ckc-muted hover:text-ckc-gold"
              >
                <Icon name="KeyIcon" size={14} variant="outline" />
                Change password
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-ckc-muted hover:text-rose-500"
              >
                <Icon name="ArrowLeftOnRectangleIcon" size={14} variant="outline" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-ckc-gold hover:text-ckc-gold-dim"
              >
                <Icon name="ArrowRightOnRectangleIcon" size={14} variant="outline" />
                Member / staff sign in
              </Link>
              <Link
                href="/request-invite"
                onClick={onClose}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-ckc-muted hover:text-ckc-gold"
              >
                <Icon name="UserPlusIcon" size={14} variant="outline" />
                Request membership
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
