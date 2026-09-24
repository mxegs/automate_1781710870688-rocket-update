# CKC check-in design review — source bundle

Copied on 24 Sep 2026 for an outside collaborator. This file is a copy only. The app source was not changed.

Notes before the copies:

- Ticket check-in is `src/app/api/events/tickets/verify/route.ts`. There is no separate scan route.
- `src/lib/auth/session.ts` is 365 lines, so it is truncated to the first 150 and last 50.
- Guardian, dependants, and `familyGroupId` are TypeScript fields on the membership application. No migration adds guardian or dependant columns or tables. They are stored inside `membership_applications.application_data` (jsonb), defined in `supabase/migrations/20250619000000_initial_schema.sql`.
- `scripts/seed-sample-content.cjs` is shown as the first 60 lines only. Those lines are helpers. Campus and event rows are inserted later in that same file (members from about line 164, events from about line 227, insert into `events` at line 347).

---

## 1. src/lib/events/service.ts

```ts
import { apiFetch, staffHeaders, useBackend } from '@/lib/api/client';
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

export async function uploadEventImage(
  file: File,
  eventId?: string,
): Promise<{ url: string; path: string }> {
  const formData = new FormData();
  formData.append('file', file);
  if (eventId) formData.append('eventId', eventId);

  const res = await fetch('/api/events/upload-image', {
    method: 'POST',
    headers: staffHeaders(),
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
```

---

## 2. src/lib/events/types.ts

```ts
import type { CampusId } from '@/lib/church/constants';
import type { ContentVisibility } from '@/lib/sermons/types';

export type EventStatus = 'upcoming' | 'ongoing' | 'completed';
export type PaymentStatus = 'free' | 'pending' | 'paid' | 'refunded';

export interface ChurchEvent {
  id: string;
  title: string;
  description: string;
  eventInfo: string;
  campus: CampusId;
  visibility: ContentVisibility;
  category: string;
  location: string;
  venueName?: string;
  venueAddress?: string;
  venueCity?: string;
  venueDirectionsUrl?: string;
  importantInfo?: string;
  startsAt: string;
  endsAt?: string;
  date: string;
  time: string;
  imageUrl?: string;
  capacity?: number;
  rsvpCount: number;
  isPaid: boolean;
  priceCents?: number;
  currency: string;
  yocoPaymentLink?: string;
  reminderHoursBefore: number;
  status: EventStatus;
}

export interface EventRsvp {
  id: string;
  eventId: string;
  name: string;
  phone?: string;
  email?: string;
  status: 'going' | 'maybe' | 'declined';
  isVisitor: boolean;
  guestsCount: number;
  paymentStatus: PaymentStatus;
  ticketCode?: string;
  rsvpAt: string;
}

export interface EventInput {
  title: string;
  description?: string;
  eventInfo?: string;
  campus: CampusId;
  visibility: ContentVisibility;
  category: string;
  location: string;
  venueName?: string;
  venueAddress?: string;
  venueCity?: string;
  venueDirectionsUrl?: string;
  importantInfo?: string;
  startsAt: string;
  endsAt?: string;
  imageUrl?: string;
  capacity?: number;
  isPaid?: boolean;
  priceCents?: number;
  yocoPaymentLink?: string;
  reminderHoursBefore?: number;
}

export const EVENT_CATEGORIES = [
  'Sunday Service',
  'Prayer Meeting',
  'Youth Event',
  "Men's Ministry",
  "Women's Ministry",
  'Conference',
  'Outreach',
  'General',
] as const;

export const EVENT_VISIBILITY_OPTIONS = [
  {
    value: 'campus_only' as ContentVisibility,
    label: 'This campus only',
    hint: 'Regular services — visible to this campus members',
  },
  {
    value: 'church_wide' as ContentVisibility,
    label: 'All CKC campuses (collective)',
    hint: 'Joint events — appears on Midrand and Verulam',
  },
  {
    value: 'members_only' as ContentVisibility,
    label: 'Members only (this campus)',
    hint: 'Not shown to visitors',
  },
];
```

---

## 3. src/lib/auth/session.ts

365 lines. Truncated: first 150 and last 50. Lines 151–314 are omitted.

```ts
import { findDemoUser } from './demo-users';
import { apiFetch, useBackend } from '@/lib/api/client';

export type UserRole =
  | 'member'
  | 'visitor'
  | 'admin'
  | 'pastor'
  | 'leader'
  | 'senior_pastor'
  | 'administrative_manager';
export type ViewMode = 'staff' | 'member';

export interface AuthSession {
  phone: string;
  email?: string;
  role: UserRole;
  campusId?: string;
  isSuperAdmin?: boolean;
  dbRole?: string;
  /** Legal/full name from membership form */
  officialName?: string;
  /** Custom app username — how we greet them day-to-day */
  username?: string;
  /** Preferred short display name (defaults to username) */
  displayName?: string;
  inviteVerified?: boolean;
  /** Staff may browse the member portal without losing their role */
  viewMode?: ViewMode;
}

const SESSION_KEY = 'ckc_session';
const INVITE_KEY = 'ckc_invite_session';

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function formatPhoneDisplay(phone: string): string {
  const digits = normalizePhone(phone);
  if (digits.startsWith('27') && digits.length === 11) {
    return `+27 ${digits.slice(2, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  if (digits.length === 10 && digits.startsWith('0')) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return phone;
}

export function getDisplayName(session: AuthSession | null): string {
  if (!session) return 'Friend';
  return session.displayName || session.username || session.officialName || 'Friend';
}

export function isStaffRole(role: UserRole): boolean {
  return (
    role === 'admin' ||
    role === 'pastor' ||
    role === 'leader' ||
    role === 'senior_pastor' ||
    role === 'administrative_manager'
  );
}

/** Whether this phone may sign in as a member (demo users + pending invites). */
export async function isRegisteredMemberEmail(email: string): Promise<boolean> {
  const normalized = normalizeEmailValue(email);
  if (!normalized.includes('@')) return false;

  if (useBackend()) {
    try {
      const res = await apiFetch<{ registered: boolean }>(
        `/api/auth/check-email?email=${encodeURIComponent(normalized)}`,
      );
      return res.registered;
    } catch {
      return false;
    }
  }

  return false;
}

export async function fetchProfileByEmail(email: string): Promise<{
  email: string;
  phone: string;
  role: UserRole;
  dbRole?: string;
  isSuperAdmin?: boolean;
  officialName?: string;
  username?: string;
  displayName?: string;
  campusId?: string;
} | null> {
  if (!useBackend()) return null;
  return apiFetch<{
    email: string;
    phone: string;
    role: UserRole;
    dbRole?: string;
    isSuperAdmin?: boolean;
    officialName?: string;
    username?: string;
    displayName?: string;
    campusId?: string;
  } | null>(`/api/profiles/lookup-email?email=${encodeURIComponent(email)}`).catch(() => null);
}

export async function resolveSessionFromEmailAsync(
  email: string,
  options?: { asVisitor?: boolean },
): Promise<AuthSession> {
  const normalized = normalizeEmailValue(email);

  if (options?.asVisitor) {
    return {
      phone: '',
      email: normalized,
      role: 'visitor',
      displayName: normalized.split('@')[0] || 'Guest',
      username: 'guest',
    };
  }

  const profile = await fetchProfileByEmail(normalized);
  if (!profile) {
    throw new Error('Profile not found');
  }

  const session: AuthSession = {
    phone: profile.phone,
    email: normalized,
    role: profile.role,
    campusId: profile.campusId,
    isSuperAdmin: profile.isSuperAdmin,
    dbRole: profile.dbRole,
    officialName: profile.officialName,
    username: profile.username,
    displayName: profile.displayName,
  };
  if (isStaffRole(profile.role)) {
    session.viewMode = 'staff';
  }
  return session;
}

// … lines 151–314 omitted …

export interface InviteSession {
  phone: string;
  email?: string;
  token: string;
  officialName?: string;
  givenName?: string;
  surname?: string;
  username?: string;
}

export function setInviteSession(data: InviteSession): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(INVITE_KEY, JSON.stringify({ ...data, verifiedAt: Date.now() }));
}

export function getInviteSession(): InviteSession | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(INVITE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return {
      phone: parsed.phone,
      email: parsed.email,
      token: parsed.token,
      officialName: parsed.officialName,
      givenName: parsed.givenName,
      surname: parsed.surname,
      username: parsed.username,
    };
  } catch {
    return null;
  }
}

export function clearInviteSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(INVITE_KEY);
}

export function getPostLoginRoute(role: UserRole, viewMode?: ViewMode): string {
  if (role === 'visitor') return '/member/church-info';
  if (viewMode === 'member') return '/member';
  if (role === 'member') return '/member';
  if (role === 'leader') return '/my-groups';
  return '/dashboard';
}

/** @deprecated use resolveSessionFromPhone */
export function resolveRoleFromPhone(phone: string): UserRole {
  return resolveSessionFromPhone(phone).role;
}
```

---

## 4. src/lib/member/campus.ts

```ts
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
```

---

## 5. src/components/AppShell.tsx

```tsx
'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import RouteGuard from '@/components/auth/RouteGuard';
import ChurchLifeShell from '@/components/church-life/ChurchLifeShell';

type PortalAccess = 'staff' | 'member' | 'shared' | 'visitor' | 'group-leader';

export default function AppShell({
  children,
  access = 'member',
}: {
  children: React.ReactNode;
  access?: PortalAccess;
}) {
  const isChurchLife =
    access === 'member' || access === 'visitor' || access === 'shared';

  if (isChurchLife) {
    return <ChurchLifeShell access={access}>{children}</ChurchLifeShell>;
  }

  const portal = access === 'group-leader' ? 'staff' : access;

  return (
    <RouteGuard portal={portal} access={access}>
      <div className="min-h-screen bg-ckc-black">
        <Sidebar />
        <div className="md:ml-60 pt-14 md:pt-0 transition-all duration-300">
          <main className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-5xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}
```

---

## 6. src/components/events/EventRegisterPanel.tsx

```tsx
'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { rsvpToEvent } from '@/lib/events/service';
import { formatEventSummary, formatPrice } from '@/lib/events/utils';
import { getCampusLabel } from '@/lib/church/constants';
import type { ChurchEvent } from '@/lib/events/types';
import type { VisitorEventProfile } from '@/lib/events/visitor-profile';
import { visitorDisplayName } from '@/lib/events/visitor-profile';

interface EventRegisterPanelProps {
  event: ChurchEvent;
  isVisitor: boolean;
  memberName?: string;
  memberPhone?: string;
  memberEmail?: string;
  visitorProfile?: VisitorEventProfile | null;
  embedded?: boolean;
}

export default function EventRegisterPanel({
  event,
  isVisitor,
  memberName = '',
  memberPhone = '',
  memberEmail = '',
  visitorProfile = null,
  embedded = false,
}: EventRegisterPanelProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const [ticketCode, setTicketCode] = useState<string | null>(null);

  const displayName = isVisitor && visitorProfile ? visitorDisplayName(visitorProfile) : memberName;
  const phone = isVisitor && visitorProfile ? visitorProfile.phone : memberPhone;
  const email = isVisitor && visitorProfile ? visitorProfile.email : memberEmail;

  const handleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await rsvpToEvent(event.id, {
        name: displayName.trim(),
        phone: phone?.trim() || undefined,
        email: email?.trim() || undefined,
        isVisitor,
        visitorId: visitorProfile?.visitorId,
        guestsCount: 1,
      });

      if (result.paymentUrl) {
        window.open(result.paymentUrl, '_blank');
      }

      setTicketCode(result.ticketCode ?? result.rsvp.ticketCode ?? null);
      setRegistered(true);
      setShowConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const panelClass = embedded ? 'space-y-4' : 'rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4';

  if (registered) {
    return (
      <div className={embedded ? 'space-y-4' : 'rounded-2xl border border-ckc-gold/30 bg-ckc-gold/10 p-6'}>
        <div className="text-center">
          <Icon name="CheckCircleIcon" size={44} variant="solid" className="mx-auto text-ckc-gold mb-3" />
          <h3 className="text-lg font-bold text-cloud">You&apos;re registered!</h3>
          <p className="text-sm text-cloud/60 mt-2">
            You have just registered for <strong className="text-cloud">{event.title}</strong>.
          </p>
        </div>

        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 text-sm text-cloud/70">
          <p>
            <span className="text-cloud/40">Date:</span> {event.date} · {event.time}
          </p>
          <p>
            <span className="text-cloud/40">Location:</span> {event.location || getCampusLabel(event.campus)}
          </p>
          {event.description && (
            <p>
              <span className="text-cloud/40">About:</span> {event.description}
            </p>
          )}
          {ticketCode && (
            <p className="pt-2 font-mono text-lg font-bold tracking-widest text-ckc-gold">{ticketCode}</p>
          )}
        </div>

        <p className="text-xs text-cloud/40 text-center mt-4">We look forward to seeing you there.</p>
      </div>
    );
  }

  if (showConfirm) {
    return (
      <div className={panelClass}>
        <h3 className="text-lg font-bold text-cloud">Confirm registration</h3>
        <p className="text-sm text-cloud/60">
          Are you sure you want to attend <strong className="text-cloud">{event.title}</strong>?
        </p>
        <p className="text-xs text-cloud/40">{formatEventSummary(event)}</p>
        {event.isPaid && event.priceCents && (
          <p className="text-sm text-ckc-gold">This is a paid event — {formatPrice(event.priceCents, event.currency)}</p>
        )}

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowConfirm(false)}
            disabled={loading}
            className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-semibold text-cloud/70 hover:border-white/20"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
            className="flex-1 rounded-xl bg-ckc-gold py-3 text-sm font-bold text-ckc-black hover:bg-ckc-gold-light disabled:opacity-50"
          >
            {loading ? 'Registering…' : 'Yes, register me'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={panelClass}>
      {!embedded && (
        <h2 className="text-lg font-bold text-cloud">
          {isVisitor ? 'Register for this event' : 'Your registration'}
        </h2>
      )}

      {!isVisitor && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-cloud/70 space-y-1">
          <p>
            <span className="text-cloud/40">Name:</span> {displayName || '—'}
          </p>
          {phone && (
            <p>
              <span className="text-cloud/40">Phone:</span> {phone}
            </p>
          )}
          {email && (
            <p>
              <span className="text-cloud/40">Email:</span> {email}
            </p>
          )}
        </div>
      )}

      {isVisitor && visitorProfile && (
        <p className="text-sm text-cloud/60">
          Registering as <strong className="text-cloud">{displayName}</strong>
        </p>
      )}

      {event.isPaid && event.priceCents ? (
        <p className="text-sm text-ckc-gold">Paid event — {formatPrice(event.priceCents, event.currency)} via Yoco</p>
      ) : (
        <p className="text-sm text-cloud/50">This event is free. Tap below to reserve your place.</p>
      )}

      {error && <p className="text-sm text-rose-400">{error}</p>}

      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="w-full rounded-xl bg-ckc-gold py-3 text-sm font-bold text-ckc-black hover:bg-ckc-gold-light"
      >
        {event.isPaid ? 'Register & pay' : 'RSVP'}
      </button>
    </div>
  );
}
```

---

## 7. src/components/church-life/LifeHero.tsx

```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import LifePhoto from '@/components/church-life/LifePhoto';
import { LIFE_PHOTOS } from '@/lib/church-life/imagery';

interface LifeHeroProps {
  imageUrl?: string;
  titleLead: string;
  titleRest?: string;
  href?: string;
  onClick?: () => void;
  badge?: string;
  cta?: string;
}

export default function LifeHero({
  imageUrl,
  titleLead,
  titleRest,
  href,
  onClick,
  badge = 'Featured',
  cta,
}: LifeHeroProps) {
  const inner = (
    <div className="relative h-[280px] w-full overflow-hidden rounded-[28px] bg-ckc-black">
      <LifePhoto src={imageUrl || LIFE_PHOTOS.worship} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        {badge ? (
          <span className="mb-2 inline-flex rounded-full bg-ckc-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ckc-gold-text">
            {badge}
          </span>
        ) : null}
        <h2 className="font-serif text-[26px] font-semibold leading-tight text-white">{titleLead}</h2>
        {titleRest ? <p className="mt-1 text-sm text-white/80">{titleRest}</p> : null}
        {cta ? (
          <span className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-ckc-black">
            {cta}
          </span>
        ) : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="block w-full text-left">
        {inner}
      </button>
    );
  }

  return inner;
}
```

---

## 8. src/app/api/events/tickets/verify/route.ts

This is the only file under `src/app/api/events/tickets/`.

```ts
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code')?.trim().toUpperCase();
  if (!code) return NextResponse.json({ error: 'Ticket code required' }, { status: 400 });

  const { data: rsvp, error } = await db
    .from('event_rsvps')
    .select('*, events(*)')
    .eq('ticket_code', code)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!rsvp) return NextResponse.json({ valid: false });

  if (rsvp.payment_status === 'pending') {
    return NextResponse.json({ valid: false, reason: 'Payment pending' });
  }

  return NextResponse.json({
    valid: true,
    alreadyScanned: Boolean(rsvp.ticket_scanned_at),
    rsvp: {
      id: rsvp.id,
      name: rsvp.name,
      guestsCount: rsvp.guests_count,
      ticketCode: rsvp.ticket_code,
    },
    event: {
      id: rsvp.events.id,
      title: rsvp.events.title,
      startsAt: rsvp.events.starts_at,
    },
  });
}

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const { code } = await request.json();
  if (!code) return NextResponse.json({ error: 'Ticket code required' }, { status: 400 });

  const { data: rsvp, error } = await db
    .from('event_rsvps')
    .select('*')
    .eq('ticket_code', code.trim().toUpperCase())
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!rsvp) return NextResponse.json({ valid: false });
  if (rsvp.payment_status === 'pending') {
    return NextResponse.json({ valid: false, reason: 'Payment pending' });
  }

  await db
    .from('event_rsvps')
    .update({ ticket_scanned_at: new Date().toISOString() })
    .eq('id', rsvp.id);

  return NextResponse.json({ valid: true, scanned: true, name: rsvp.name });
}
```

---

## 9. src/lib/membership/types.ts

This file defines `Dependant`, `guardian`, and `familyGroupId`.

```ts
export interface Dependant {
  name: string;
  surname: string;
  age: number | '';
  /** System-wide child serial, e.g. CKC-0001 */
  familySerial?: string;
}

export interface MembershipApplication {
  submittedAt?: string;
  personal: {
    todayDate: string;
    surname: string;
    fullName: string;
    username: string;
    campus: 'midrand' | 'verulam' | '';
    identityType: 'sa_id' | 'passport' | '';
    identityNumber: string;
    dateOfBirth: string;
    age: number | '';
    permanentAddress: string;
    email: string;
    cellNo: string;
    telNo: string;
    gender: 'Male' | 'Female' | '';
    citizenship: 'RSA' | 'Other' | '';
    countryOfOrigin: string;
    maritalStatus: '' | 'Never Married' | 'Married' | 'Divorced' | 'Engaged' | 'Widow or Widower';
    occupation: string[];
    occupationOther: string;
    employer: string;
    contactName: string;
    contactTel: string;
    idPhotoDataUrl: string;
  };
  guardian: {
    title: string;
    fullName: string;
    surname: string;
    identityNumber: string;
    familyGroupId: string;
    relationship: string;
    telHome: string;
    telWork: string;
    streetAddress: string;
    occupation: string;
    organisation: string;
    spouseJoining: '' | 'Yes' | 'No';
    numberOfDependants: number | '';
    dependants: Dependant[];
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  spiritual: {
    acceptedChrist: '' | 'Yes' | 'No';
    baptized: '' | 'Yes' | 'No';
    baptismDate: string;
    baptismLocation: string;
    previousChurchMember: '' | 'Yes' | 'No';
    previousChurchName: string;
    previousChurchDate: string;
    previousChurchLocation: string;
    reasonForLeaving: string;
  };
  ministry: {
    areasOfInterest: string[];
    spiritualGifts: string;
    ministryPassions: string;
  };
  covenant: {
    agreedToCovenant: boolean;
    fullName: string;
    dateSigned: string;
    signatureDataUrl: string;
  };
}

export const OCCUPATION_OPTIONS = [
  'Scholar',
  'Government Sector',
  'University Student',
  'Business',
  'Technikon Student',
  'Private Sector',
  'Other',
] as const;

export const MINISTRY_OPTIONS = [
  "Worship Team",
  "Children's Ministry",
  'Youth Ministry',
  'Hospitality',
  'Outreach / Evangelism',
  'Media / Technology',
  'Prayer Team',
  'Other',
] as const;

export const COVENANT_TEXT = {
  conformity: [
    { text: 'Attending weekly worship faithfully', ref: 'Hebrews 10:23-25' },
    {
      text: 'Committing to grow in a lifestyle that manifests itself in a passionate commitment to Christ, biblical alignment, personal holiness, generous living, racial reconciliation, and social responsibility',
      ref: 'II Peter 3:17-18; Ephesians 4:14-16',
    },
    {
      text: 'Engaging in spiritual relationships that bring mutual support and accountability',
      ref: 'Romans 14:19; Ephesians 5:21',
    },
    {
      text: 'Taking the time to serve others with my spiritual gifts',
      ref: 'Romans 12:4-21; Galatians 5:13-14',
    },
  ],
  support: [
    {
      text: 'Participating cheerfully and regularly in the financial support of the ministry and obligations of the church',
      ref: 'II Corinthians 9:6-7',
    },
    { text: 'Supporting others fervently in Christian love', ref: 'I Peter 4:8' },
    { text: "Upholding others in prayer and bearing one another's burdens", ref: 'Galatians 6:2' },
    { text: 'Developing relationships with and inviting the unchurched to attend', ref: 'Colossians 4:5-6' },
  ],
  unity: [
    { text: 'Acting in love toward other members', ref: 'I Peter 1:22' },
    { text: 'Seeking open and honest communication when I have concerns', ref: 'Ephesians 4:15' },
    { text: 'Dealing biblically with conflict and refusing to gossip', ref: 'Matthew 18:15-20' },
    {
      text: 'Following the leadership of the church and submitting to the principles of church restoration',
      ref: 'Hebrews 13:17; Matthew 18:15-20',
    },
  ],
};

export function createEmptyApplication(cellNo = ''): MembershipApplication {
  const today = new Date().toISOString().split('T')[0];
  return {
    personal: {
      todayDate: today,
      surname: '',
      fullName: '',
      username: '',
      campus: '',
      identityType: '',
      identityNumber: '',
      dateOfBirth: '',
      age: '',
      permanentAddress: '',
      email: '',
      cellNo,
      telNo: '',
      gender: '',
      citizenship: '',
      countryOfOrigin: '',
      maritalStatus: '',
      occupation: [],
      occupationOther: '',
      employer: '',
      contactName: '',
      contactTel: '',
      idPhotoDataUrl: '',
    },
    guardian: {
      title: '',
      fullName: '',
      surname: '',
      identityNumber: '',
      familyGroupId: '',
      relationship: '',
      telHome: '',
      telWork: '',
      streetAddress: '',
      occupation: '',
      organisation: '',
      spouseJoining: '',
      numberOfDependants: '',
      dependants: [],
    },
    emergencyContact: { name: '', relationship: '', phoneNumber: '' },
    spiritual: {
      acceptedChrist: '',
      baptized: '',
      baptismDate: '',
      baptismLocation: '',
      previousChurchMember: '',
      previousChurchName: '',
      previousChurchDate: '',
      previousChurchLocation: '',
      reasonForLeaving: '',
    },
    ministry: { areasOfInterest: [], spiritualGifts: '', ministryPassions: '' },
    covenant: { agreedToCovenant: false, fullName: '', dateSigned: today, signatureDataUrl: '' },
  };
}

export const DRAFT_STORAGE_KEY = 'ckc_membership_draft';
```

---

## 10. Guardian / dependant migration

No file under `supabase/migrations` contains `guardian` or `dependant`.

Family fields are not columns. They live in the JSON blob `membership_applications.application_data`, created in `supabase/migrations/20250619000000_initial_schema.sql`:

```sql
create table public.membership_applications (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid references public.invites (id) on delete set null,
  phone text not null,
  campus_id text not null references public.campuses (id),
  status public.application_status not null default 'draft',
  application_data jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

The shape of that JSON is the `MembershipApplication` type in section 9. `guardian.familyGroupId` and `guardian.dependants` are properties inside `application_data`.

---

## 11. tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ckc: {
          black: '#0A0A0A',
          card: '#1A1A1A',
          block: '#1E1E1E',
          surface: '#141414',
          elevated: '#1C1C1C',
          white: '#FFFFFF',
          muted: '#888888',
          dim: '#737373',
          gold: '#C5A073',
          'gold-button': '#D9B985',
          'gold-light': '#D4BC94',
          'gold-dim': '#8A7340',
          'gold-text': '#000000',
        },
        life: {
          page: '#F7F3EE',
          content: '#F7F3EE',
        },
        slate: {
          DEFAULT: '#1A1A1A',
          dark: '#0A0A0A',
          mid: '#1E1E1E',
        },
        sky: {
          DEFAULT: '#C5A073',
          dim: '#8A7340',
          bright: '#D4BC94',
        },
        admin: '#666666',
        cloud: {
          DEFAULT: '#FFFFFF',
          dim: '#E5E5E5',
        },
      },
      backgroundImage: {
        'ckc-header': 'linear-gradient(180deg, #FFFFFF 0%, #C0C0C0 100%)',
        'ckc-gold': 'linear-gradient(180deg, #D4BC94 0%, #C5A073 100%)',
        'ckc-surface': 'linear-gradient(180deg, #1C1C1C 0%, #0A0A0A 100%)',
        'ckc-life-fade': 'linear-gradient(180deg, #FFFFFF 0%, #E8E8E8 40%, #1A1A1A 100%)',
      },
      boxShadow: {
        ckc: '0px 4px 20px rgba(197, 160, 115, 0.12)',
        'ckc-lg': '0px 12px 32px rgba(197, 160, 115, 0.18)',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      letterSpacing: {
        tightest: '-0.06em',
      },
      maxWidth: {
        life: '430px',
      },
    },
  },
  plugins: [],
};
```

---

## 12. scripts/seed-sample-content.cjs

First 60 lines only.

```js
/**
 * Sample content for reviewing the CKC app.
 * Inserts through the same tables the admin/member screens use,
 * so records can be deleted later from Events, Sermons, Members, Prayer, etc.
 *
 * Marker: emails @ckc-sample.test and phones 0820000xxx
 * Does not send SMS or email.
 *
 * Run: node --env-file=.env scripts/seed-sample-content.cjs
 */
const { createClient } = require('@supabase/supabase-js');

const SAMPLE_DOMAIN = 'ckc-sample.test';
const WATCH_URL = 'https://www.christkingdomcitizens.com/watch/';
const VENUE = {
  venue_name: 'CKC Midrand',
  venue_address: '75 Van Riebeek Street, Glen Austin',
  venue_city: 'Midrand',
  venue_directions_url: 'https://maps.google.com/?q=75+Van+Riebeek+Glen+Austin+Midrand',
};

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function iso(daysFromNow, hour = 8, minute = 30) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function dateOnly(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

function birthdayThisWeek(offsetDays, year) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function ageFromDob(dob) {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

function applicationPayload(person, campus) {
  const today = dateOnly(0);
  return {
```
