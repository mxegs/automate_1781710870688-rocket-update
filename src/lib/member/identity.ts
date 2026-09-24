import { apiFetch } from '@/lib/api/client';
import { getSession } from '@/lib/auth/session';

export async function resolveMemberIdsFromSession(): Promise<{ profileId: string; memberId: string | null } | null> {
  const session = getSession();
  if (!session?.phone && !session?.email) return null;

  const params = new URLSearchParams();
  if (session.phone) params.set('phone', session.phone);
  if (session.email) params.set('email', session.email);

  const ids = await apiFetch<{ profileId: string | null; memberId: string | null }>(
    `/api/member/identity?${params}`,
  ).catch(() => null);

  if (!ids?.profileId) return null;
  return { profileId: ids.profileId, memberId: ids.memberId };
}
