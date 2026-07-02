'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import EventDetailCard from '@/components/events/EventDetailCard';
import { getEventById } from '@/lib/events/service';
import type { ChurchEvent } from '@/lib/events/types';

/** Admin preview of a single event (same layout as member portal). */
export default function AdminEventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [event, setEvent] = useState<ChurchEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEventById(eventId).then((e) => {
      setEvent(e);
      setLoading(false);
    });
  }, [eventId]);

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
      <AppShell access="staff">
        <p className="py-12 text-center text-cloud/40">Loading event…</p>
      </AppShell>
    );
  }

  if (!event) {
    return (
      <AppShell access="staff">
        <div className="py-12 text-center">
          <p className="text-cloud/60">Event not found</p>
          <Link href="/events" className="mt-2 inline-block text-sm text-ckc-gold">
            ← Back to events
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell access="staff">
      <div className="mx-auto max-w-lg">
        <Link
          href="/events"
          className="mb-4 inline-flex items-center gap-1 text-sm text-cloud/50 hover:text-ckc-gold"
        >
          <Icon name="ArrowLeftIcon" size={14} variant="outline" />
          Back to events
        </Link>

        <EventDetailCard
          event={event}
          onAction={() => window.open(`/rsvp/${event.id}`, '_blank', 'noopener,noreferrer')}
          onShare={handleShare}
          theme="dark"
        />
      </div>
    </AppShell>
  );
}
