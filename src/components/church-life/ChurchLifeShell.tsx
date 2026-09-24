'use client';

import React, { useState } from 'react';
import RouteGuard from '@/components/auth/RouteGuard';
import ChurchBrandingProvider from '@/components/church-life/ChurchBrandingProvider';
import ChurchLifeHeader from '@/components/church-life/ChurchLifeHeader';
import ChurchLifeNavDrawer from '@/components/church-life/ChurchLifeNavDrawer';
import { getSession } from '@/lib/auth/session';
import { memberLifeNav, visitorLifeNav } from '@/lib/church-life/nav';

type ChurchLifeAccess = 'member' | 'visitor' | 'shared';

export default function ChurchLifeShell({
  children,
  access = 'member',
}: {
  children: React.ReactNode;
  access?: ChurchLifeAccess;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const session = getSession();
  // Public shared pages + legacy visitor access use the guest Church Life shell
  const isGuestShell =
    access === 'visitor' ||
    (access === 'shared' && (!session || session.role === 'visitor'));
  const portal = isGuestShell ? 'visitor' : 'member';
  const navItems = isGuestShell ? visitorLifeNav : memberLifeNav;
  const portalLabel = isGuestShell ? 'Visitor' : 'Member Portal';
  const homeHref = isGuestShell ? '/member/church-info' : '/member';

  return (
    <ChurchBrandingProvider churchId={session?.churchId}>
      <RouteGuard portal={portal} access={access}>
        {/* Desktop/tablet: centered phone-width column; always mobile layout */}
        <div className="min-h-screen bg-life-page">
          <div
            data-portal="church-life"
            className="relative mx-auto flex min-h-dvh w-full max-w-life flex-col bg-life-page"
          >
            <ChurchLifeHeader onMenuOpen={() => setMenuOpen(true)} homeHref={homeHref} />
            <ChurchLifeNavDrawer
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              navItems={navItems}
              portalLabel={portalLabel}
            />
            <main className="flex min-h-0 flex-1 flex-col text-ckc-black">{children}</main>
          </div>
        </div>
      </RouteGuard>
    </ChurchBrandingProvider>
  );
}
