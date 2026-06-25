'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import EventRegisterPanel from '@/components/events/EventRegisterPanel';
import VisitorEventSignupForm from '@/components/events/VisitorEventSignupForm';
import EventDetailSections from '@/components/events/EventDetailSections';
import EventDetailFooter, { EventEntryBar } from '@/components/events/EventDetailFooter';
import { getEventById } from '@/lib/events/service';
import {
  getVisitorEventProfile,
  hasCompleteVisitorEventProfile,
  type VisitorEventProfile,
} from '@/lib/events/visitor-profile';
import type { ChurchEvent } from '@/lib/events/types';

/** Public RSVP portal — shareable link for visitors */
export default function RsvpPortalPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const [event, setEvent] = useState<ChurchEvent | null>(null);
  const [visitorProfile, setVisitorProfile] = useState<VisitorEventProfile | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    getEventById(eventId).then(setEvent);
    setVisitorProfile(getVisitorEventProfile());
  }, [eventId]);

  const visitorReady = hasCompleteVisitorEventProfile(visitorProfile);

  const handleShare = async () => {
    if (!event) return;
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: event.title, url }).catch(() => undefined);
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="min-h-screen bg-ckc-black px-4 py-8 pb-28">
      <div className="mx-auto max-w-lg">
        <div className="flex justify-center mb-6">
          <AppLogo size={64} />
        </div>

        {!event ? (
          <p className="text-center text-cloud/40">Loading…</p>
        ) : (
          <>
            <Link href="/login" className="text-xs text-cloud/40 hover:text-ckc-gold mb-4 inline-block">
              ← Church app home
            </Link>

            {event.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={event.imageUrl} alt={event.title} className="w-full rounded-2xl object-cover aspect-video" />
            ) : (
              <div className="w-full rounded-2xl bg-white/5 aspect-video flex items-center justify-center">
                <Icon name="CalendarDaysIcon" size={48} variant="outline" className="text-cloud/20" />
              </div>
            )}

            <h1 className="text-xl font-bold text-cloud mt-5">{event.title}</h1>

            <div className="mt-5">
              <EventDetailSections event={event} />
            </div>

            <EventEntryBar event={event} />
          </>
        )}
      </div>

      {event && (
        <EventDetailFooter event={event} onAction={() => setShowRegister(true)} onShare={handleShare} />
      )}

      {showRegister && event && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#1E293B] p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold text-cloud">
                {!visitorReady ? 'Visitor sign-up' : 'RSVP'}
              </h2>
              <button type="button" onClick={() => setShowRegister(false)} className="text-cloud/40 hover:text-cloud">
                ✕
              </button>
            </div>
            {!visitorReady ? (
              <VisitorEventSignupForm campusId={event.campus} onComplete={(p) => setVisitorProfile(p)} />
            ) : (
              <EventRegisterPanel event={event} isVisitor visitorProfile={visitorProfile} embedded />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
