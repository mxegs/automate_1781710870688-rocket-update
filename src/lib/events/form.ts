import type { ChurchEvent, EventInput } from './types';

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function churchEventToInput(event: ChurchEvent): EventInput {
  return {
    title: event.title,
    description: event.description,
    eventInfo: event.eventInfo,
    campus: event.campus,
    visibility: event.visibility,
    category: event.category,
    location: event.location,
    venueName: event.venueName ?? '',
    venueAddress: event.venueAddress ?? '',
    venueCity: event.venueCity ?? '',
    venueDirectionsUrl: event.venueDirectionsUrl ?? '',
    importantInfo: event.importantInfo ?? '',
    startsAt: toDatetimeLocal(event.startsAt),
    endsAt: event.endsAt ? toDatetimeLocal(event.endsAt) : '',
    imageUrl: event.imageUrl ?? '',
    capacity: event.capacity,
    isPaid: event.isPaid,
    priceCents: event.priceCents,
    yocoPaymentLink: event.yocoPaymentLink ?? '',
    reminderHoursBefore: event.reminderHoursBefore,
  };
}

export function eventActionLabel(event: ChurchEvent): string {
  return event.isPaid && event.priceCents ? 'Continue Booking' : 'RSVP';
}
