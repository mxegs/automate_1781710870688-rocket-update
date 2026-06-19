import { apiFetch, useBackend } from '@/lib/api/client';
import type { CampusId } from '@/lib/church/constants';
import type { ChurchEvent, EventInput, EventRsvp } from './types';

export async function getAdminEvents(options: {
  campusId?: CampusId;
  allCampuses?: boolean;
}): Promise<ChurchEvent[]> {
  if (!useBackend()) return [];
  const params = new URLSearchParams({ forAdmin: 'true' });
  if (options.allCampuses) params.set('allCampuses', 'true');
  else if (options.campusId) params.set('campusId', options.campusId);
  return apiFetch<ChurchEvent[]>(`/api/events?${params}`);
}

export async function getMemberEventsFeed(options: {
  memberCampus?: CampusId;
  isVisitor?: boolean;
}): Promise<ChurchEvent[]> {
  if (!useBackend()) return [];
  const params = new URLSearchParams();
  if (options.memberCampus) params.set('memberCampus', options.memberCampus);
  if (options.isVisitor) params.set('isVisitor', 'true');
  return apiFetch<ChurchEvent[]>(`/api/events?${params}`);
}

export async function getEventById(id: string): Promise<ChurchEvent | null> {
  if (!useBackend()) return null;
  try {
    return await apiFetch<ChurchEvent>(`/api/events/${id}`);
  } catch {
    return null;
  }
}

export async function createEvent(input: EventInput): Promise<ChurchEvent> {
  return apiFetch<ChurchEvent>('/api/events', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateEvent(id: string, input: Partial<EventInput>): Promise<ChurchEvent> {
  return apiFetch<ChurchEvent>(`/api/events/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteEvent(id: string): Promise<void> {
  await apiFetch(`/api/events/${id}`, { method: 'DELETE' });
}

export async function rsvpToEvent(
  eventId: string,
  data: {
    name: string;
    phone?: string;
    email?: string;
    profileId?: string;
    isVisitor?: boolean;
    guestsCount?: number;
  },
): Promise<{ rsvp: EventRsvp; paymentUrl?: string; ticketCode?: string }> {
  return apiFetch(`/api/events/${eventId}/rsvp`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getEventRsvps(eventId: string): Promise<EventRsvp[]> {
  return apiFetch<EventRsvp[]>(`/api/events/${eventId}/rsvp`);
}

export async function getMyRsvp(eventId: string, phone: string): Promise<EventRsvp | null> {
  const rsvps = await getEventRsvps(eventId);
  const norm = phone.replace(/\D/g, '');
  return rsvps.find((r) => r.phone?.replace(/\D/g, '') === norm) ?? null;
}

export async function verifyTicket(code: string): Promise<{
  valid: boolean;
  rsvp?: EventRsvp;
  event?: ChurchEvent;
}> {
  return apiFetch(`/api/events/tickets/verify?code=${encodeURIComponent(code)}`);
}
