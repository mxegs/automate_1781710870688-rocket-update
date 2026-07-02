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
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-[#E5E5E5] bg-white px-4 py-3">
      <button
        type="button"
        onClick={onMenuOpen}
        className="flex h-9 w-9 items-center justify-center text-ckc-black"
        aria-label="Open menu"
      >
        <Icon name="Bars3Icon" size={22} variant="outline" />
      </button>

      <p className="flex-1 text-center text-[10px] font-bold uppercase leading-tight tracking-[0.12em] text-ckc-black sm:text-[11px]">
        {BRAND.name}
      </p>

      <Link href={homeHref} className="flex-shrink-0" aria-label="Home">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ckc-black text-[10px] font-bold text-white">
          CKC
        </div>
      </Link>
    </header>
  );
}
