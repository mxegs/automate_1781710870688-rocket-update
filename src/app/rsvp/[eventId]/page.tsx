'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import EventRegisterPanel from '@/components/events/EventRegisterPanel';
import VisitorEventSignupForm from '@/components/events/VisitorEventSignupForm';
import EventDetailCard from '@/components/events/EventDetailCard';
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
    <div className="min-h-screen bg-[#E8E8E8]">
      <div
        data-portal="church-life"
        className="relative mx-auto min-h-screen w-full max-w-life bg-white shadow-[0_0_40px_rgba(0,0,0,0.08)]"
      >
        <header className="flex items-center justify-center border-b border-[#E5E5E5] px-4 py-4">
          <AppLogo size={40} />
        </header>

        <main className="px-4 py-5 text-ckc-black">
          {!event ? (
            <p className="text-center text-ckc-muted">Loading…</p>
          ) : (
            <>
              <Link href="/login" className="mb-4 inline-flex items-center gap-1 text-sm text-ckc-muted hover:text-ckc-gold">
                <Icon name="ArrowLeftIcon" size={14} variant="outline" />
                Church app home
              </Link>

              <EventDetailCard
                event={event}
                onAction={() => setShowRegister(true)}
                onShare={handleShare}
                theme="light"
              />
            </>
          )}
        </main>
      </div>

      {showRegister && event && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
          <div className="max-h-[85vh] w-full max-w-life overflow-y-auto rounded-2xl border border-[#E5E5E5] bg-white p-6">
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-lg font-bold text-ckc-black">
                {!visitorReady ? 'Visitor sign-up' : 'RSVP'}
              </h2>
              <button type="button" onClick={() => setShowRegister(false)} className="text-ckc-muted hover:text-ckc-black">
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
