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

export interface EventMonthGroup {
  monthKey: string;
  monthLabel: string;
  events: ChurchEvent[];
}

/** Group upcoming events under month headings (e.g. "June 2026"). */
export function groupEventsByMonth(events: ChurchEvent[]): EventMonthGroup[] {
  const groups = new Map<string, ChurchEvent[]>();

  for (const event of events) {
    const d = new Date(event.startsAt);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const bucket = groups.get(monthKey) ?? [];
    bucket.push(event);
    groups.set(monthKey, bucket);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, monthEvents]) => {
      const labelDate = new Date(monthEvents[0].startsAt);
      return {
        monthKey,
        monthLabel: labelDate.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' }),
        events: monthEvents,
      };
    });
}

export function formatEventSummary(event: ChurchEvent): string {
  const location = event.venueName || event.location?.trim();
  return [event.date, event.time, location].filter(Boolean).join(' · ');
}

/** Day + month label for list rows (e.g. 23 / APR). */
export function formatEventListDate(startsAt: string): { day: string; month: string } {
  const d = new Date(startsAt);
  return {
    day: d.toLocaleDateString('en-ZA', { day: 'numeric' }),
    month: d.toLocaleDateString('en-ZA', { month: 'short' }).toUpperCase(),
  };
}
