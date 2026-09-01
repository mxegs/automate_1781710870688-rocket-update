'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import EventListRow from '@/components/events/EventListRow';
import LifeHero from '@/components/church-life/LifeHero';
import { getMemberEventsFeed } from '@/lib/events/service';
import { groupEventsByMonth } from '@/lib/events/utils';
import { resolveMemberCampus } from '@/lib/member/campus';
import { getSession } from '@/lib/auth/session';
import { useBackend } from '@/lib/api/client';

export default function MemberEventsPage() {
  const [events, setEvents] = useState<Awaited<ReturnType<typeof getMemberEventsFeed>>>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const session = getSession();
  const isVisitor = !session || session.role === 'visitor';
  const backend = useBackend();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError('');

    (async () => {
      try {
        const campus = await resolveMemberCampus();
        const list = await getMemberEventsFeed({
          memberCampus: campus,
          isVisitor,
        });
        if (!cancelled) setEvents(list);
      } catch {
        if (!cancelled) {
          setEvents([]);
          setLoadError('Could not load events. Please try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isVisitor]);

  const monthGroups = groupEventsByMonth(events);
  const heroImage = events[0]?.imageUrl;

  return (
    <AppShell access="shared">
      <div className="space-y-0">
        <LifeHero imageUrl={heroImage} titleLead="Upcoming" titleRest="events" />

        <div className="bg-life-content px-3.5 py-3.5">
          {loading ? (
            <p className="py-12 text-center text-sm text-ckc-muted">Loading events…</p>
          ) : loadError ? (
            <p className="py-12 text-center text-sm text-rose-500">{loadError}</p>
          ) : !backend ? (
            <p className="text-sm text-ckc-muted">
              No events to show — your campus admin will add events soon.
            </p>
          ) : monthGroups.length > 0 ? (
            <div className="space-y-6">
              {monthGroups.map((group) => (
                <section key={group.monthKey}>
                  <h2 className="life-month-heading">{group.monthLabel}</h2>
                  <div className="mt-2.5 space-y-2">
                    {group.events.map((event) => (
                      <EventListRow key={event.id} event={event} theme="light" />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-ckc-muted">No upcoming events for your campus.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
