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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [visitorProfile, setVisitorProfile] = useState<VisitorEventProfile | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError('');
    setEvent(null);
    setVisitorProfile(getVisitorEventProfile());

    getEventById(eventId)
      .then((found) => {
        if (cancelled) return;
        if (!found) {
          setLoadError('This event link is invalid or the event is no longer available.');
          setEvent(null);
          return;
        }
        setEvent(found);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError('Could not load this event. Please try again later.');
        setEvent(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
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
          {loading ? (
            <p className="text-center text-ckc-muted">Loading…</p>
          ) : loadError || !event ? (
            <div className="py-10 text-center space-y-3">
              <Icon name="ExclamationCircleIcon" size={28} variant="outline" className="mx-auto text-ckc-gold" />
              <p className="text-sm text-ckc-black font-medium">Event not found</p>
              <p className="text-xs text-ckc-muted leading-relaxed px-4">
                {loadError || 'This event link is invalid or the event is no longer available.'}
              </p>
              <Link href="/member/church-info" className="inline-block text-sm text-ckc-gold hover:underline">
                Back to church info
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/member/church-info"
                className="mb-4 inline-flex items-center gap-1 text-sm text-ckc-muted hover:text-ckc-gold"
              >
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
          <div className="rsvp-light max-h-[85vh] w-full max-w-life overflow-y-auto rounded-2xl border border-[#E5E5E5] bg-white p-6">
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
