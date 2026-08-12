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
      <aside className="fixed inset-y-0 left-0 z-50 w-[220px] max-w-[85vw] bg-ckc-black shadow-2xl">
        <div className="flex items-center justify-between px-3.5 py-4">
          <div>
            <p className="text-xs text-white">{displayName}</p>
            <p className="text-[9px] text-ckc-gold">{portalLabel}</p>
          </div>
          <button type="button" onClick={onClose} className="text-[#999] hover:text-white" aria-label="Close menu">
            <Icon name="XMarkIcon" size={14} variant="outline" />
          </button>
        </div>

        <nav className="space-y-0 overflow-y-auto px-2" style={{ maxHeight: 'calc(100vh - 160px)' }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-2 px-1.5 py-2 text-[11px] text-[#ccc] hover:text-white"
            >
              <Icon name={item.icon} size={13} variant="outline" className="text-ckc-gold" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 space-y-1 border-t border-[#262626] p-3">
          {isStaff && (
            <button
              type="button"
              onClick={toggleViewMode}
              className="w-full rounded-md border border-ckc-gold py-1.5 text-center text-[10px] text-ckc-gold"
            >
              {viewMode === 'staff' ? 'See Church Life' : 'Leadership desk'}
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
