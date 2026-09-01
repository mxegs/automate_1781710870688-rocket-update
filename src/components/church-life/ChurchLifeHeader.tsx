'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { BRAND } from '@/lib/assets';

interface ChurchLifeHeaderProps {
  onMenuOpen: () => void;
  homeHref?: string;
}

export default function ChurchLifeHeader({ onMenuOpen, homeHref = '/member' }: ChurchLifeHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-[0.5px] border-[#E5E5E5] bg-white px-4 py-3.5">
      <button
        type="button"
        onClick={onMenuOpen}
        className="flex h-9 w-9 items-center justify-center text-ckc-black"
        aria-label="Open menu"
      >
        <Icon name="Bars3Icon" size={20} variant="outline" />
      </button>

      <p className="flex-1 text-center text-[11px] font-medium uppercase leading-tight tracking-[1px] text-ckc-black">
        {BRAND.name}
      </p>

      <Link href={homeHref} className="flex-shrink-0" aria-label="Home">
        <div className="ckc-logo-circle">CKC</div>
      </Link>
    </header>
  );
}
