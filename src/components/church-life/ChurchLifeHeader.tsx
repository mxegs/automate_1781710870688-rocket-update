'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { getDisplayName, getSession } from '@/lib/auth/session';
import { useChurchBranding } from '@/components/church-life/ChurchBrandingProvider';

interface ChurchLifeHeaderProps {
  onMenuOpen: () => void;
  homeHref?: string;
}

export default function ChurchLifeHeader({ onMenuOpen, homeHref = '/member' }: ChurchLifeHeaderProps) {
  const session = getSession();
  const church = useChurchBranding();
  const initial = (session ? getDisplayName(session) : 'C').trim().charAt(0).toUpperCase() || 'C';

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

      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-ckc-gold text-xs font-semibold text-ckc-gold-text"
        aria-hidden
      >
        {initial}
      </div>
    </header>
  );
}
