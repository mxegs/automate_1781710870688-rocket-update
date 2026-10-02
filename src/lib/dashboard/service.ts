import { apiFetch, useBackend } from '@/lib/api/client';
import { withChurchId } from '@/lib/church/tenant';

export interface DashboardStats {
  churchId: string;
  members: number;
  visitorsThisWeek: number;
  openPrayers: number;
  upcomingEvents: number;
  nextEventTitle: string | null;
}

export async function getDashboardStats(churchId?: string): Promise<DashboardStats> {
  if (!useBackend()) {
    return {
      churchId: churchId ?? '',
      members: 0,
      visitorsThisWeek: 0,
      openPrayers: 0,
      upcomingEvents: 0,
      nextEventTitle: null,
    };
  }
  const params = withChurchId(new URLSearchParams(), churchId);
  return apiFetch<DashboardStats>(`/api/dashboard/stats?${params}`);
}
