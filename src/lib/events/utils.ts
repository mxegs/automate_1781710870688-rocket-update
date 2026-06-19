import type { ChurchEvent, EventStatus } from './types';

export function generateTicketCode(eventId: string): string {
  const part = eventId.replace(/-/g, '').slice(0, 6).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CKC-${part}-${rand}`;
}

export function deriveEventStatus(startsAt: string, endsAt?: string): EventStatus {
  const now = Date.now();
  const start = new Date(startsAt).getTime();
  const end = endsAt ? new Date(endsAt).getTime() : start + 3 * 60 * 60 * 1000;
  if (now < start) return 'upcoming';
  if (now <= end) return 'ongoing';
  return 'completed';
}

export function formatEventDateTime(startsAt: string): { date: string; time: string } {
  const d = new Date(startsAt);
  return {
    date: d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false }),
  };
}

export function formatPrice(cents: number, currency = 'ZAR'): string {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency }).format(cents / 100);
}

export function isEventSoon(event: ChurchEvent, hoursBefore = 24): boolean {
  const diff = new Date(event.startsAt).getTime() - Date.now();
  return diff > 0 && diff <= hoursBefore * 60 * 60 * 1000;
}

export function filterEventsFeed(
  events: ChurchEvent[],
  memberCampus: string | null,
  isVisitor: boolean,
): ChurchEvent[] {
  if (isVisitor) {
    return events.filter((e) => e.visibility === 'church_wide');
  }
  if (!memberCampus) {
    return events.filter((e) => e.visibility === 'church_wide');
  }
  return events.filter(
    (e) =>
      e.visibility === 'church_wide' ||
      (e.campus === memberCampus &&
        (e.visibility === 'campus_only' || e.visibility === 'members_only')),
  );
}
