import { deriveEventStatus, formatEventDateTime } from './utils';
import type { ChurchEvent } from './types';
import type { ContentVisibility } from '@/lib/sermons/types';

export function mapEventRow(
  row: Record<string, unknown>,
  rsvpCount = 0,
): ChurchEvent {
  const startsAt = row.starts_at as string;
  const endsAt = row.ends_at as string | null;
  const { date, time } = formatEventDateTime(startsAt);
  const description = (row.description as string) ?? '';
  const eventInfo = (row.event_info as string) ?? '';

  return {
    id: row.id as string,
    title: row.title as string,
    description,
    eventInfo: eventInfo || description,
    campus: row.campus_id as ChurchEvent['campus'],
    visibility: row.visibility as ContentVisibility,
    category: (row.category as string) ?? 'General',
    location: (row.location as string) ?? '',
    venueName: (row.venue_name as string) ?? undefined,
    venueAddress: (row.venue_address as string) ?? undefined,
    venueCity: (row.venue_city as string) ?? undefined,
    venueDirectionsUrl: (row.venue_directions_url as string) ?? undefined,
    importantInfo: (row.important_info as string) ?? undefined,
    startsAt,
    endsAt: endsAt ?? undefined,
    date,
    time,
    imageUrl: (row.image_url as string) ?? undefined,
    capacity: (row.capacity as number) ?? undefined,
    rsvpCount,
    isPaid: Boolean(row.is_paid),
    priceCents: (row.price_cents as number) ?? undefined,
    currency: (row.currency as string) ?? 'ZAR',
    yocoPaymentLink: (row.yoco_payment_link as string) ?? undefined,
    reminderHoursBefore: (row.reminder_hours_before as number) ?? 24,
    status: deriveEventStatus(startsAt, endsAt ?? undefined),
  };
}
