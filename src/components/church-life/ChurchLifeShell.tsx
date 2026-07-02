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
      <div className="min-h-screen bg-[#E8E8E8]">
        <div
          data-portal="church-life"
          className="relative mx-auto min-h-screen w-full max-w-life bg-white shadow-[0_0_40px_rgba(0,0,0,0.08)]"
        >
          <ChurchLifeHeader onMenuOpen={() => setMenuOpen(true)} homeHref={homeHref} />
          <ChurchLifeNavDrawer
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            navItems={navItems}
            portalLabel={portalLabel}
          />
          <main className="px-4 py-5 text-ckc-black">{children}</main>
        </div>
      </div>
    </RouteGuard>
  );
}
