'use client';

import React from 'react';
import { LIFE_PHOTOS } from '@/lib/church-life/imagery';

interface AuthShellProps {
  children: React.ReactNode;
  subtitle?: string;
  showLogo?: boolean;
  title?: string;
}

export default function AuthShell({ children, subtitle, showLogo = true, title }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-ckc-black">
      <div className="relative h-[240px] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LIFE_PHOTOS.worship} alt="" className="absolute inset-0 h-full w-full bg-ckc-black object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ckc-black via-black/40 to-black/20" />
        {showLogo && (
          <div className="absolute inset-x-0 bottom-10 px-6 text-center">
            <p className="font-serif text-[42px] font-bold leading-none tracking-tight text-white">{title || 'Welcome'}</p>
            <p className="mt-2 text-sm font-medium text-white/85">{title || ''}</p>
            {subtitle ? <p className="mt-1 text-xs text-white/70">{subtitle}</p> : null}
          </div>
        )}
      </div>

      <div className="relative z-10 -mt-6 flex flex-1 flex-col items-center px-5 pb-10">
        <div className="pointer-events-none absolute inset-0 ckc-glow" />
        <div className="relative w-full max-w-[380px]">{children}</div>
      </div>
    </div>
  );
}
