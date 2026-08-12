'use client';

import React from 'react';
import { BRAND } from '@/lib/assets';

interface AuthShellProps {
  children: React.ReactNode;
  subtitle?: string;
  showLogo?: boolean;
  title?: string;
}

export default function AuthShell({ children, subtitle, showLogo = true, title }: AuthShellProps) {
  return (
    <div className="ckc-auth-bg relative flex min-h-screen flex-col items-center justify-center px-5 py-8">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(circle at 50% 0%, #2a2416 0%, #0A0A0A 60%)' }}
      />

      <div className="relative w-full max-w-[300px]">
        {showLogo && (
          <div className="mb-5 text-center">
            <div className="ckc-logo-circle ckc-logo-circle-lg mx-auto mb-4">CKC</div>
            {title ? (
              <h1 className="text-[17px] font-medium text-white">{title}</h1>
            ) : (
              <h1 className="text-[17px] font-medium text-white">{BRAND.name}</h1>
            )}
            {subtitle && <p className="mt-1 text-[11px] text-[#999]">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
