'use client';

import React, { useState } from 'react';
import RouteGuard from '@/components/auth/RouteGuard';
import ChurchLifeHeader from '@/components/church-life/ChurchLifeHeader';
import ChurchLifeNavDrawer from '@/components/church-life/ChurchLifeNavDrawer';
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
  const portal = access === 'visitor' ? 'visitor' : 'member';
  const navItems = portal === 'visitor' ? visitorLifeNav : memberLifeNav;
  const portalLabel = portal === 'visitor' ? 'Visitor Access' : 'Member Portal';
  const homeHref = portal === 'visitor' ? '/visitor' : '/member';

  return (
    <RouteGuard portal={portal} access={access}>
      {/* Desktop/tablet: centered phone-width column; always mobile layout */}
      <div className="min-h-screen bg-life-page">
        <div
          data-portal="church-life"
          className="relative mx-auto flex min-h-dvh w-full max-w-life flex-col bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_0_0_1px_#E5E5E5]"
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
  );
}
