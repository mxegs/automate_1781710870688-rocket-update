'use client';

import React from 'react';
import Image from 'next/image';
import { BRAND } from '@/lib/assets';

interface AuthShellProps {
  children: React.ReactNode;
  subtitle?: string;
  showLogo?: boolean;
}

export default function AuthShell({ children, subtitle, showLogo = true }: AuthShellProps) {
  return (
    <div className="ckc-auth-bg ckc-glow relative flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-ckc-gold/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {showLogo && (
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center">
              <Image
                src={BRAND.logo}
                alt={BRAND.name}
                width={96}
                height={96}
                className="h-24 w-24 object-contain"
                priority
              />
            </div>
            <h1 className="ckc-gradient-title text-xl font-bold tracking-tight">{BRAND.name}</h1>
            {subtitle && <p className="mt-1 text-sm text-ckc-muted">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
