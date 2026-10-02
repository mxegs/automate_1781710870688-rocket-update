'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import PageHeader, { ContentCard, StatCard } from '@/components/portal/PageHeader';
import { getDashboardStats, type DashboardStats } from '@/lib/dashboard/service';
import { getAdminEvents } from '@/lib/events/service';
import { resolveMemberChurch } from '@/lib/member/campus';
import type { ChurchEvent } from '@/lib/events/types';

function upcomingFromNow(events: ChurchEvent[]): ChurchEvent[] {
  const now = Date.now();
  return events
    .filter((e) => new Date(e.startsAt).getTime() >= now)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}

export default function DashboardPage() {
  const [upcomingEvents, setUpcomingEvents] = useState<ChurchEvent[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const churchId = resolveMemberChurch();
    Promise.all([
      getDashboardStats(churchId),
      getAdminEvents({ churchId, allCampuses: true }),
    ])
      .then(([nextStats, events]) => {
        setStats(nextStats);
        setUpcomingEvents(upcomingFromNow(events).slice(0, 4));
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Could not load dashboard');
      });
  }, []);

  return (
    <AppShell access="staff">
      <PageHeader
        personalized
        title="Church Dashboard"
        subtitle="Here's what's happening at your church today."
      />

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Members" value={stats ? String(stats.members) : '—'} icon="UsersIcon" />
        <StatCard
          label="New Visitors"
          value={stats ? String(stats.visitorsThisWeek) : '—'}
          change="This week"
          icon="UserPlusIcon"
        />
        <StatCard
          label="Open Prayer Requests"
          value={stats ? String(stats.openPrayers) : '—'}
          icon="HeartIcon"
        />
        <StatCard
          label="Upcoming Events"
          value={stats ? String(stats.upcomingEvents) : '—'}
          change={stats?.nextEventTitle ? `Next: ${stats.nextEventTitle}` : undefined}
          icon="CalendarDaysIcon"
        />
      </div>

      <ContentCard
        title="Upcoming Events"
        icon="CalendarDaysIcon"
        action={
          <Link href="/events" className="text-xs font-medium text-ckc-gold hover:text-ckc-gold-light">
            View all →
          </Link>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {upcomingEvents.map((ev) => (
            <div
              key={ev.id}
              className="rounded-xl border border-white/10 bg-white/5 p-3 transition-colors hover:border-ckc-gold/30"
            >
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-ckc-gold/10">
                  <Icon name="CalendarDaysIcon" size={14} variant="outline" className="text-ckc-gold" />
                </div>
                <span className="text-xs font-medium text-cloud/40">{ev.category}</span>
              </div>
              <p className="mb-1 text-sm font-semibold text-cloud">{ev.title}</p>
              <p className="text-xs text-cloud/50">
                {ev.date} at {ev.time}
              </p>
              <p className="mt-1.5 text-xs font-medium text-ckc-gold">{ev.rsvpCount} attending</p>
            </div>
          ))}
          {upcomingEvents.length === 0 && (
            <p className="text-xs text-cloud/40 col-span-full">No upcoming events — create one in Events.</p>
          )}
        </div>
      </ContentCard>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Send Invite', href: '/members', icon: 'PaperAirplaneIcon' },
          { label: 'Register Visitor', href: '/visitors', icon: 'ClipboardDocumentListIcon' },
          { label: 'New Event', href: '/events', icon: 'CalendarDaysIcon' },
          { label: 'Prayer Request', href: '/prayer-requests', icon: 'HeartIcon' },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-all hover:border-ckc-gold/30 hover:bg-ckc-gold/5"
          >
            <Icon name={action.icon} size={16} variant="outline" className="text-ckc-gold" />
            <span className="text-sm font-medium text-cloud/70 transition-colors group-hover:text-cloud">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
