'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import EventRsvpForm from '@/components/events/EventRsvpForm';
import { getEventById } from '@/lib/events/service';
import { formatPrice } from '@/lib/events/utils';
import { getCampusLabel } from '@/lib/church/constants';
import { getDisplayName, getSession } from '@/lib/auth/session';
import type { ChurchEvent } from '@/lib/events/types';

export default function MemberEventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [event, setEvent] = useState<ChurchEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const session = getSession();
  const isVisitor = session?.role === 'visitor';

  useEffect(() => {
    getEventById(eventId).then((e) => {
      setEvent(e);
      setLoading(false);
    });
  }, [eventId]);

  if (loading) {
    return (
      <AppShell access="shared">
        <p className="text-cloud/40 text-center py-12">Loading event…</p>
      </AppShell>
    );
  }

  if (!event) {
    return (
      <AppShell access="shared">
        <div className="text-center py-12">
          <p className="text-cloud/60">Event not found</p>
          <Link href="/member/events" className="text-ckc-gold text-sm mt-2 inline-block">← Back to events</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell access="shared">
      <Link href="/member/events" className="inline-flex items-center gap-1 text-sm text-cloud/50 hover:text-ckc-gold mb-4">
        <Icon name="ArrowLeftIcon" size={14} variant="outline" />
        All events
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          {event.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.imageUrl} alt={event.title} className="w-full rounded-2xl object-cover aspect-video" />
          ) : (
            <div className="w-full rounded-2xl bg-white/5 aspect-video flex items-center justify-center">
              <Icon name="CalendarDaysIcon" size={48} variant="outline" className="text-cloud/20" />
            </div>
          )}

          <div className="mt-4">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="rounded-full border border-ckc-gold/30 bg-ckc-gold/10 px-2.5 py-0.5 text-xs text-ckc-gold">
                {event.category}
              </span>
              {event.visibility === 'church_wide' && (
                <span className="rounded-full border border-sky/30 bg-sky/10 px-2.5 py-0.5 text-xs text-sky">
                  All campuses
                </span>
              )}
              {event.isPaid && event.priceCents && (
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-400">
                  {formatPrice(event.priceCents, event.currency)}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-cloud">{event.title}</h1>
            <div className="mt-3 space-y-1 text-sm text-cloud/60">
              <p className="flex items-center gap-2">
                <Icon name="CalendarDaysIcon" size={16} variant="outline" />
                {event.date} · {event.time}
              </p>
              <p className="flex items-center gap-2">
                <Icon name="MapPinIcon" size={16} variant="outline" />
                {event.location || getCampusLabel(event.campus)}
              </p>
              <p className="flex items-center gap-2">
                <Icon name="UsersIcon" size={16} variant="outline" />
                {event.rsvpCount} registered
                {event.capacity ? ` / ${event.capacity} capacity` : ''}
              </p>
            </div>
            {event.description && (
              <p className="mt-4 text-sm text-cloud/70 leading-relaxed">{event.description}</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-bold text-cloud mb-4">
            {isVisitor ? 'Register as visitor' : 'RSVP'}
          </h2>
          <EventRsvpForm
            event={event}
            defaultName={isVisitor ? '' : getDisplayName(session)}
            defaultPhone={session?.phone ?? ''}
            isVisitor={isVisitor}
          />
        </div>
      </div>
    </AppShell>
  );
}
