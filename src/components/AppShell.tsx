'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import RouteGuard from '@/components/auth/RouteGuard';
import ChurchLifeShell from '@/components/church-life/ChurchLifeShell';

type PortalAccess = 'staff' | 'member' | 'shared' | 'visitor' | 'group-leader';

export default function AppShell({
  children,
  access = 'member',
}: {
  children: React.ReactNode;
  access?: PortalAccess;
}) {
  const isChurchLife =
    access === 'member' || access === 'visitor' || access === 'shared';

  if (isChurchLife) {
    return (
      <ChurchLifeShell access={access === 'shared' ? 'member' : access}>
        {children}
      </ChurchLifeShell>
    );
  }

  const portal = access === 'group-leader' ? 'staff' : access;

  return (
    <RouteGuard portal={portal} access={access}>
      <div className="min-h-screen bg-ckc-black">
        <Sidebar />
        <div className="md:ml-60 pt-14 md:pt-0 transition-all duration-300">
          <main className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-5xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}
