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
  const session = getSession();
  const isVisitor = session?.role === 'visitor';
  const backend = useBackend();

  useEffect(() => {
    (async () => {
      const campus = await resolveMemberCampus();
      const list = await getMemberEventsFeed({
        memberCampus: campus,
        isVisitor,
      });
      setEvents(list);
    })();
  }, [isVisitor]);

  const monthGroups = groupEventsByMonth(events);
  const heroImage = events[0]?.imageUrl;

  return (
    <AppShell access="shared">
      <div className="space-y-6">
        <LifeHero imageUrl={heroImage} titleLead="Upcoming" titleRest="Events" />

        {!backend && (
          <p className="text-sm text-ckc-muted">No events to show — your campus admin will add events soon.</p>
        )}

        {monthGroups.length > 0 ? (
          <div className="space-y-8">
            {monthGroups.map((group) => (
              <section key={group.monthKey}>
                <h2 className="life-month-heading">{group.monthLabel}</h2>
                <div className="mt-4 space-y-3">
                  {group.events.map((event) => (
                    <EventListRow key={event.id} event={event} theme="light" />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          backend && (
            <p className="py-12 text-center text-ckc-muted">No upcoming events for your campus.</p>
          )
        )}
      </div>
    </AppShell>
  );
}
