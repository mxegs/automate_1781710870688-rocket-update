'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import EventRegisterPanel from '@/components/events/EventRegisterPanel';
import VisitorEventSignupForm from '@/components/events/VisitorEventSignupForm';
import EventDetailSections from '@/components/events/EventDetailSections';
import EventDetailFooter, { EventEntryBar } from '@/components/events/EventDetailFooter';
import { getEventById } from '@/lib/events/service';
import { eventActionLabel } from '@/lib/events/form';
import { getDisplayName, getSession } from '@/lib/auth/session';
import {
  getVisitorEventProfile,
  hasCompleteVisitorEventProfile,
  type VisitorEventProfile,
} from '@/lib/events/visitor-profile';
import type { ChurchEvent } from '@/lib/events/types';

export default function MemberEventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [event, setEvent] = useState<ChurchEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [visitorProfile, setVisitorProfile] = useState<VisitorEventProfile | null>(null);
  const session = getSession();
  const isVisitor = session?.role === 'visitor';

  useEffect(() => {
    getEventById(eventId).then((e) => {
      setEvent(e);
      setLoading(false);
    });
    if (isVisitor) {
      setVisitorProfile(getVisitorEventProfile());
    }
  }, [eventId, isVisitor]);

  const handleShare = async () => {
    if (!event) return;
    const url = `${window.location.origin}/rsvp/${event.id}`;
    if (navigator.share) {
      await navigator.share({ title: event.title, url }).catch(() => undefined);
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

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

  const visitorReady = !isVisitor || hasCompleteVisitorEventProfile(visitorProfile);
  const registerLabel = eventActionLabel(event);

  return (
    <AppShell access="shared">
      <div className="pb-28 max-w-lg mx-auto">
        <Link href="/member/events" className="inline-flex items-center gap-1 text-sm text-cloud/50 hover:text-ckc-gold mb-4">
          <Icon name="ArrowLeftIcon" size={14} variant="outline" />
          Back to events
        </Link>

        {event.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.imageUrl} alt={event.title} className="w-full rounded-2xl object-cover aspect-video" />
        ) : (
          <div className="w-full rounded-2xl bg-white/5 aspect-video flex items-center justify-center">
            <Icon name="CalendarDaysIcon" size={48} variant="outline" className="text-cloud/20" />
          </div>
        )}

        <h1 className="mt-5 text-2xl font-bold text-cloud">{event.title}</h1>

        <div className="mt-5">
          <EventDetailSections event={event} />
        </div>

        <EventEntryBar event={event} />
      </div>

      <EventDetailFooter event={event} onAction={() => setShowRegister(true)} onShare={handleShare} />

      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#1E293B] p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold text-cloud">
                {isVisitor && !visitorReady ? 'Visitor sign-up' : registerLabel}
              </h2>
              <button type="button" onClick={() => setShowRegister(false)} className="text-cloud/40 hover:text-cloud">
                ✕
              </button>
            </div>

            {isVisitor && !visitorReady ? (
              <VisitorEventSignupForm
                campusId={event.campus}
                onComplete={(profile) => setVisitorProfile(profile)}
              />
            ) : (
              <EventRegisterPanel
                event={event}
                isVisitor={isVisitor}
                memberName={getDisplayName(session)}
                memberPhone={session?.phone ?? ''}
                memberEmail={session?.email ?? ''}
                visitorProfile={visitorProfile}
                embedded
              />
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
