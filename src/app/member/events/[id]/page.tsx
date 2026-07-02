'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import EventRegisterPanel from '@/components/events/EventRegisterPanel';
import VisitorEventSignupForm from '@/components/events/VisitorEventSignupForm';
import EventDetailCard from '@/components/events/EventDetailCard';
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
        <p className="text-center py-12 text-ckc-muted">Loading event…</p>
      </AppShell>
    );
  }

  if (!event) {
    return (
      <AppShell access="shared">
        <div className="py-12 text-center">
          <p className="text-ckc-muted">Event not found</p>
          <Link href="/member/events" className="mt-2 inline-block text-sm text-ckc-gold">
            ← Back to events
          </Link>
        </div>
      </AppShell>
    );
  }

  const visitorReady = !isVisitor || hasCompleteVisitorEventProfile(visitorProfile);
  const registerLabel = eventActionLabel(event);

  return (
    <AppShell access="shared">
      <div className="mx-auto max-w-lg">
        <Link
          href="/member/events"
          className="mb-4 inline-flex items-center gap-1 text-sm text-ckc-muted hover:text-ckc-gold"
        >
          <Icon name="ArrowLeftIcon" size={14} variant="outline" />
          Back to events
        </Link>

        <EventDetailCard
          event={event}
          onAction={() => setShowRegister(true)}
          onShare={handleShare}
          theme="light"
        />
      </div>

      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-lg font-bold text-ckc-black">
                {isVisitor && !visitorReady ? 'Visitor sign-up' : registerLabel}
              </h2>
              <button type="button" onClick={() => setShowRegister(false)} className="text-ckc-muted hover:text-ckc-black">
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
