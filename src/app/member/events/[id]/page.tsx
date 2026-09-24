'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import EventRegisterPanel from '@/components/events/EventRegisterPanel';
import VisitorEventSignupForm from '@/components/events/VisitorEventSignupForm';
import EventDetailCard from '@/components/events/EventDetailCard';
import CheckInPanel from '@/components/events/CheckInPanel';
import { getEventById, getMyCheckin, type MyCheckIn } from '@/lib/events/service';
import { eventActionLabel } from '@/lib/events/form';
import { getDisplayName, getSession } from '@/lib/auth/session';
import { resolveMemberChurch } from '@/lib/member/campus';
import { resolveMemberIdsFromSession } from '@/lib/member/identity';
import { getMembershipApplication } from '@/lib/membership/service';
import type { Dependant } from '@/lib/membership/types';
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
  const [checkin, setCheckin] = useState<MyCheckIn | null>(null);
  const [dependants, setDependants] = useState<Dependant[]>([]);
  const [memberIds, setMemberIds] = useState<{ profileId?: string; memberId?: string }>({});
  const [isEventDay, setIsEventDay] = useState(false);
  const session = getSession();
  const isVisitor = !session || session.role === 'visitor';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const churchId = resolveMemberChurch();
    getEventById(eventId, churchId)
      .then(async (loaded) => {
        if (cancelled) return;
        setEvent(loaded);
        if (!loaded || isVisitor) return;
        const start = new Date(loaded.startsAt).getTime();
        const end = loaded.endsAt ? new Date(loaded.endsAt).getTime() : start + 2 * 60 * 60 * 1000;
        const now = Date.now();
        const open = now >= start && now <= end;
        setIsEventDay(open);
        const ids = await resolveMemberIdsFromSession();
        if (cancelled) return;
        setMemberIds({ profileId: ids?.profileId, memberId: ids?.memberId ?? undefined });
        if (ids?.profileId) {
          const mine = await getMyCheckin(loaded.id, ids.profileId).catch(() => null);
          if (!cancelled) setCheckin(mine);
        }
        if (session?.phone) {
          const application = await getMembershipApplication(session.phone, churchId).catch(() => null);
          if (!cancelled) setDependants(application?.guardian?.dependants ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) setEvent(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    if (isVisitor) {
      setVisitorProfile(getVisitorEventProfile());
    }
    return () => {
      cancelled = true;
    };
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
      <div className="life-section">
        <Link
          href="/member/events"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ckc-muted hover:text-ckc-gold-dim"
        >
          <Icon name="ArrowLeftIcon" size={11} variant="outline" />
          Back to events
        </Link>

        {!isVisitor && isEventDay && !checkin ? (
          <CheckInPanel
            event={event}
            profileId={memberIds.profileId}
            memberId={memberIds.memberId}
            dependants={dependants}
            memberName={getDisplayName(session)}
          />
        ) : null}
        <EventDetailCard
          event={event}
          onAction={() => setShowRegister(true)}
          onShare={handleShare}
          theme="light"
        />
      </div>

      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
          <div className="rsvp-light max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-xl">
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
