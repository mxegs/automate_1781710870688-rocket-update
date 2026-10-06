'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { apiFetch } from '@/lib/api/client';
import { getDisplayName, getSession } from '@/lib/auth/session';
import { useChurchBranding } from '@/components/church-life/ChurchBrandingProvider';

interface ChurchLifeHeaderProps {
  onMenuOpen: () => void;
  homeHref?: string;
  showNotifications?: boolean;
}

export default function ChurchLifeHeader({
  onMenuOpen,
  homeHref = '/member',
  showNotifications = false,
}: ChurchLifeHeaderProps) {
  const session = getSession();
  const church = useChurchBranding();
  const pathname = usePathname();
  const initial = (session ? getDisplayName(session) : 'C').trim().charAt(0).toUpperCase() || 'C';
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!showNotifications || !session?.email) return;
    let cancelled = false;
    apiFetch<{ unreadCount: number }>('/api/me/notifications')
      .then((data) => {
        if (!cancelled) setUnread(data.unreadCount ?? 0);
      })
      .catch(() => {
        if (!cancelled) setUnread(0);
      });
    return () => {
      cancelled = true;
    };
  }, [showNotifications, session?.email, pathname]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 bg-life-page/95 px-4 py-3.5 backdrop-blur-md">
      <button
        type="button"
        onClick={onMenuOpen}
        className="flex h-9 w-9 items-center justify-center text-ckc-black"
        aria-label="Open menu"
      >
        <Icon name="Bars3Icon" size={20} variant="outline" />
      </button>

      <Link href={homeHref} className="flex-1 text-center" aria-label="Home">
        <p className="truncate font-serif text-lg font-bold tracking-tight text-ckc-black">{church.name}</p>
      </Link>

      <div className="flex flex-shrink-0 items-center gap-2">
        {showNotifications ? (
          <Link
            href="/member/notifications"
            className="relative flex h-8 w-8 items-center justify-center text-ckc-black"
            aria-label={unread ? `${unread} unread notifications` : 'Notifications'}
          >
            <Icon name="BellIcon" size={20} variant="outline" />
            {unread > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 min-w-[16px] rounded-full bg-ckc-gold px-1 text-center text-[10px] font-semibold text-ckc-gold-text">
                {unread > 99 ? '99+' : unread}
              </span>
            ) : null}
          </Link>
        ) : null}
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-ckc-gold text-xs font-semibold text-ckc-gold-text"
          aria-hidden
        >
          {initial}
        </div>
      </div>
    </header>
  );
}
