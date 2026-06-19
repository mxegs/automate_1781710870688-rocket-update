'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import { getMemberEventsFeed } from '@/lib/events/service';
import { resolveMemberCampus } from '@/lib/member/campus';
import { getSession } from '@/lib/auth/session';
import { useBackend } from '@/lib/api/client';
import { getCampusLabel } from '@/lib/church/constants';
import { formatPrice } from '@/lib/events/utils';
import type { ChurchEvent } from '@/lib/events/types';

export default function MemberEventsPage() {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => (
          <Link
            key={e.id}
            href={`/member/events/${e.id}`}
            className="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-ckc-gold/30 transition-colors"
          >
            {e.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={e.imageUrl} alt={e.title} className="w-full h-36 object-cover" />
            ) : (
              <div className="w-full h-36 bg-white/5 flex items-center justify-center">
                <Icon name="CalendarDaysIcon" size={32} variant="outline" className="text-cloud/20" />
              </div>
            )}
            <div className="p-4">
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className="text-[10px] font-semibold uppercase text-ckc-gold">{e.category}</span>
                {e.visibility === 'church_wide' && (
                  <span className="text-[10px] text-sky">All campuses</span>
                )}
              </div>
              <h3 className="font-bold text-cloud group-hover:text-ckc-gold transition-colors">{e.title}</h3>
              <p className="text-xs text-cloud/40 mt-1">{e.date} · {e.time}</p>
              <p className="text-xs text-cloud/30 mt-0.5">{e.location || getCampusLabel(e.campus)}</p>
              {e.isPaid && e.priceCents && (
                <p className="text-xs text-emerald-400 mt-2">{formatPrice(e.priceCents, e.currency)}</p>
              )}
              <p className="text-xs text-ckc-gold mt-3 font-semibold">RSVP →</p>
            </div>
          </Link>
        ))}
      </div>

      {backend && events.length === 0 && (
        <p className="text-center text-cloud/40 py-12">No upcoming events for your campus.</p>
      )}
    </AppShell>
  );
}
