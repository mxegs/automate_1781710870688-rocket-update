'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { canAccessRoute } from '@/lib/auth/permissions';
import { getGroupsLedBy } from '@/lib/groups/service';
import {
  getPostLoginRoute,
  getSession,
  getViewMode,
  isStaffRole,
} from '@/lib/auth/session';
import type { UserRole } from '@/lib/auth/session';

type PortalAccess = 'staff' | 'member' | 'shared' | 'visitor' | 'group-leader';

interface RouteGuardProps {
  children: React.ReactNode;
  portal: 'staff' | 'member' | 'visitor';
  access?: PortalAccess;
}

export default function RouteGuard({ children, portal, access = 'member' }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(false);
    const session = getSession();

    if (!session) {
      router.replace('/login');
      return;
    }

    const viewMode = getViewMode(session);

    (async () => {
      const led = await getGroupsLedBy(session.phone);
      const leadsGroups = led.length > 0;

      if (!canAccessRoute(session.role, pathname, viewMode)) {
        router.replace(getPostLoginRoute(session.role, viewMode));
        return;
      }

      let portalOk = false;
      const staffInMemberView = isStaffRole(session.role) && viewMode === 'member';

      if (access === 'visitor') {
        portalOk = session.role === 'visitor';
      } else if (access === 'shared') {
        portalOk =
          session.role === 'member' ||
          session.role === 'visitor' ||
          staffInMemberView;
      } else if (access === 'group-leader') {
        portalOk =
          (isStaffRole(session.role) && viewMode !== 'member') || leadsGroups;
      } else if (access === 'staff') {
        portalOk = isStaffRole(session.role) && viewMode !== 'member';
      } else if (portal === 'member') {
        portalOk = session.role === 'member' || staffInMemberView;
      } else if (portal === 'visitor') {
        portalOk = session.role === 'visitor';
      } else if (portal === 'staff') {
        portalOk = isStaffRole(session.role) && viewMode !== 'member';
      }

      if (!portalOk) {
        router.replace(getPostLoginRoute(session.role as UserRole, viewMode));
        return;
      }

      setAllowed(true);
    })();
  }, [pathname, portal, access, router]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ckc-black text-ckc-muted">
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
