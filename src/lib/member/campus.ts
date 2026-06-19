import type { CampusId } from '@/lib/church/constants';
import { getCampusLabel } from '@/lib/church/constants';
import { getSession } from '@/lib/auth/session';
import { fetchProfileByPhone } from '@/lib/auth/session';
import { findDemoUser } from '@/lib/auth/demo-users';
import { useBackend } from '@/lib/api/client';

/** Resolve the member's campus for campus-scoped feeds */
export async function resolveMemberCampus(): Promise<CampusId | undefined> {
  const session = getSession();
  if (!session) return undefined;

  if (session.campusId) return session.campusId as CampusId;

  if (useBackend()) {
    const profile = await fetchProfileByPhone(session.phone);
    if (profile?.campusId) return profile.campusId as CampusId;
  }

  const demo = findDemoUser(session.phone);
  if (demo?.campusId) return demo.campusId;

  return 'midrand';
}

export function getCampusFeedTitle(campusId?: CampusId): string {
  if (!campusId) return 'CKC Member Portal';
  return `${getCampusLabel(campusId)} Feed`;
}
