'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import EventListRow from '@/components/events/EventListRow';
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

  return (
    <AppShell access="shared">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-cloud tracking-tight">Events</h1>
        <p className="text-cloud/40 text-sm mt-0.5">
          {isVisitor ? 'Church-wide events open to visitors' : 'Your campus events & joint services'}
        </p>
      </div>

      {!backend && (
        <p className="text-sm text-cloud/40 mb-4">No events to show — your campus admin will add events soon.</p>
      )}

      {monthGroups.length > 0 ? (
        <div className="space-y-8">
          {monthGroups.map((group) => (
            <section key={group.monthKey}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ckc-gold">
                {group.monthLabel}
              </h2>
              <div className="space-y-3">
                {group.events.map((event) => (
                  <EventListRow key={event.id} event={event} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        backend && (
          <p className="text-center text-cloud/40 py-12">No upcoming events for your campus.</p>
        )
      )}
    </AppShell>
  );
}
