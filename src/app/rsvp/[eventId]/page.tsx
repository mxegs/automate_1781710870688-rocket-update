'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import EventRsvpForm from '@/components/events/EventRsvpForm';
import { getEventById } from '@/lib/events/service';
import { getCampusLabel } from '@/lib/church/constants';
import type { ChurchEvent } from '@/lib/events/types';

/** Public RSVP portal — shareable link for visitors */
export default function RsvpPortalPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const [event, setEvent] = useState<ChurchEvent | null>(null);

  useEffect(() => {
    getEventById(eventId).then(setEvent);
  }, [eventId]);

  return (
    <div className="min-h-screen bg-ckc-black px-4 py-8">
      <div className="mx-auto max-w-md">
        <div className="flex justify-center mb-6">
          <AppLogo size={64} />
        </div>

        {!event ? (
          <p className="text-center text-cloud/40">Loading…</p>
        ) : (
          <>
            <h1 className="text-xl font-bold text-cloud text-center">{event.title}</h1>
            <p className="text-sm text-cloud/50 text-center mt-1">
              {event.date} · {event.time} · {event.location || getCampusLabel(event.campus)}
            </p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-base font-bold text-cloud mb-4">RSVP for this event</h2>
              <EventRsvpForm event={event} isVisitor />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
