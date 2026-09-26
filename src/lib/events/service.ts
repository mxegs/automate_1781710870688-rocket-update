import { apiFetch, sessionHeaders, useBackend } from '@/lib/api/client';
import { resolveMemberChurch } from '@/lib/member/campus';
import type { CampusId } from '@/lib/church/constants';
import { withChurchId } from '@/lib/church/tenant';
import type { ChurchEvent, EventInput, EventRsvp } from './types';

export async function getAdminEvents(options: {
  churchId?: string;
  campusId?: CampusId;
  allCampuses?: boolean;
}): Promise<ChurchEvent[]> {
  if (!useBackend()) return [];
  const params = new URLSearchParams({ forAdmin: 'true' });
  withChurchId(params, options.churchId);
  if (options.allCampuses) params.set('allCampuses', 'true');
  else if (options.campusId) params.set('campusId', options.campusId);
  return apiFetch<ChurchEvent[]>(`/api/events?${params}`);
}

export async function getMemberEventsFeed(options: {
  churchId?: string;
  memberCampus?: CampusId;
  isVisitor?: boolean;
}): Promise<ChurchEvent[]> {
  if (!useBackend()) return [];
  const params = new URLSearchParams();
  withChurchId(params, options.churchId);
  if (options.memberCampus) params.set('memberCampus', options.memberCampus);
  if (options.isVisitor) params.set('isVisitor', 'true');
  return apiFetch<ChurchEvent[]>(`/api/events?${params}`);
}

export async function getEventById(id: string, churchId?: string): Promise<ChurchEvent | null> {
  if (!useBackend()) return null;
  try {
    const params = withChurchId(new URLSearchParams(), churchId);
    return await apiFetch<ChurchEvent>(`/api/events/${id}?${params}`);
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

export async function uploadEventImage(
  file: File,
  eventId?: string,
): Promise<{ url: string; path: string }> {
  const formData = new FormData();
  formData.append('file', file);
  if (eventId) formData.append('eventId', eventId);

  const res = await fetch('/api/events/upload-image', {
    method: 'POST',
    headers: sessionHeaders(),
    body: formData,
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || `Upload failed (${res.status})`);
  }

  return body as { url: string; path: string };
}

export async function rsvpToEvent(
  eventId: string,
  data: {
    name: string;
    phone?: string;
    email?: string;
    profileId?: string;
    visitorId?: string;
    isVisitor?: boolean;
    guestsCount?: number;
  },
): Promise<{ rsvp: EventRsvp; paymentUrl?: string; ticketCode?: string }> {
  return apiFetch(`/api/events/${eventId}/rsvp`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function registerEventVisitor(data: {
  givenName: string;
  surname: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female';
  maritalStatus: string;
  acceptedJesus: boolean;
  wantsToJoinChurch: boolean;
  eventNewsConsent: boolean;
  campusId?: string;
}): Promise<{ visitor: { id: string; name: string; email: string; phone: string } }> {
  return apiFetch('/api/visitors/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getEventRsvps(eventId: string, churchId?: string): Promise<EventRsvp[]> {
  const params = withChurchId(new URLSearchParams(), churchId);
  return apiFetch<EventRsvp[]>(`/api/events/${eventId}/rsvp?${params}`);
}

export async function getMyRsvp(eventId: string, phone: string, churchId?: string): Promise<EventRsvp | null> {
  const rsvps = await getEventRsvps(eventId, churchId);
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

export type CheckInMethod = 'self' | 'kiosk' | 'scanner' | 'staff';

export interface EventCheckIn {
  id: string;
  eventId: string;
  campusId?: string;
  profileId?: string;
  memberId?: string;
  rsvpId?: string;
  isDependant: boolean;
  dependantName?: string;
  guardianMemberId?: string;
  room?: string;
  seat?: string;
  securityCode?: string;
  method: CheckInMethod;
  checkedInAt: string;
}

export interface CheckInPayload {
  eventId: string;
  churchId?: string;
  profileId?: string;
  memberId?: string;
  rsvpId?: string;
  dependants?: { name: string; room?: string }[];
  room?: string;
  seat?: string;
  method?: CheckInMethod;
}

export interface MyCheckIn {
  id: string;
  eventId: string;
  room?: string;
  seat?: string;
  securityCode?: string;
  checkedInAt: string;
}

export interface TodayCheckIn {
  event: ChurchEvent | null;
  checkin: MyCheckIn | null;
  dependants: EventCheckIn[];
}

export async function createCheckin(payload: CheckInPayload): Promise<{
  primary: EventCheckIn;
  dependants: EventCheckIn[];
}> {
  const params = withChurchId(new URLSearchParams(), payload.churchId ?? resolveMemberChurch());
  return apiFetch(`/api/events/checkins?${params}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getEventCheckins(eventId: string, churchId?: string): Promise<EventCheckIn[]> {
  const params = withChurchId(new URLSearchParams(), churchId ?? resolveMemberChurch());
  return apiFetch(`/api/events/${eventId}/checkins?${params}`);
}

export async function getMyCheckin(
  eventId: string,
  profileId: string,
  churchId?: string,
): Promise<MyCheckIn | null> {
  const params = new URLSearchParams({ eventId, profileId });
  withChurchId(params, churchId ?? resolveMemberChurch());
  return apiFetch(`/api/events/checkins/me?${params}`);
}

export async function getMyCheckinForToday(
  campusId?: CampusId,
  profileId?: string,
  churchId?: string,
): Promise<TodayCheckIn> {
  const params = new URLSearchParams();
  withChurchId(params, churchId);
  if (campusId) params.set('campusId', campusId);
  if (profileId) params.set('profileId', profileId);
  return apiFetch(`/api/events/checkins/today?${params}`);
}
