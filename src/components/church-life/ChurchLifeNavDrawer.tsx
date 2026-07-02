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
import { useRouter } from 'next/navigation';

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
  const session = getSession();
  const displayName = getDisplayName(session);
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
      <aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-ckc-black shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <div>
            <p className="text-sm font-bold text-white">{displayName}</p>
            <p className="text-xs text-ckc-gold">{portalLabel}</p>
          </div>
          <button type="button" onClick={onClose} className="text-white/50 hover:text-white" aria-label="Close menu">
            <Icon name="XMarkIcon" size={20} variant="outline" />
          </button>
        </div>

        <nav className="space-y-1 overflow-y-auto p-3" style={{ maxHeight: 'calc(100vh - 160px)' }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-ckc-gold"
            >
              <Icon name={item.icon} size={18} variant="outline" className="text-ckc-gold" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 space-y-1 border-t border-white/10 p-3">
          {isStaff && (
            <button
              type="button"
              onClick={toggleViewMode}
              className="flex w-full items-center gap-2 rounded-lg border border-ckc-gold/30 bg-ckc-gold/10 px-3 py-2 text-xs text-ckc-gold"
            >
              <Icon name="ArrowsRightLeftIcon" size={14} variant="outline" />
              {viewMode === 'staff' ? 'See Church Life' : 'Leadership Desk'}
            </button>
          )}
          <Link
            href="/account/change-password"
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/40 hover:text-ckc-gold"
          >
            <Icon name="KeyIcon" size={14} variant="outline" />
            Change password
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/40 hover:text-rose-400"
          >
            <Icon name="ArrowLeftOnRectangleIcon" size={14} variant="outline" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
