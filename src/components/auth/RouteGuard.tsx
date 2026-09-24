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

    // Shared Church Life pages (sermons, events, daily word, church info) are public
    if (access === 'shared' && !session) {
      setAllowed(true);
      return;
    }

    if (!session) {
      router.replace('/login');
      return;
    }

    const viewMode = getViewMode(session);

    (async () => {
      let leadsGroups = false;
      if (access === 'group-leader') {
        try {
          const led = await getGroupsLedBy(session.phone);
          leadsGroups = led.length > 0;
        } catch {
          leadsGroups = false;
        }
      }

      if (!canAccessRoute(session.role, pathname, viewMode, session.isSuperAdmin)) {
        router.replace(getPostLoginRoute(session.role, viewMode));
        return;
      }

      let portalOk = false;
      const staffInMemberView = isStaffRole(session.role) && viewMode === 'member';

      if (access === 'visitor') {
        // Legacy visitor home — send guests to public church info
        router.replace('/member/church-info');
        return;
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
        router.replace('/member/church-info');
        return;
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
      <div className="flex min-h-screen items-center justify-center bg-life-page text-ckc-muted">
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
