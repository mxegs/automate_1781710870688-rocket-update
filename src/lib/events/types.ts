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
