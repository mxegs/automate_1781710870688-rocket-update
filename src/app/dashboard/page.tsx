'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import PageHeader, { ContentCard, StatCard } from '@/components/portal/PageHeader';
import { getAdminEvents } from '@/lib/events/service';
import type { ChurchEvent } from '@/lib/events/types';

const recentVisitors = [
  { name: 'Thabo Mokoena', date: 'Sun 15 Jun', status: 'New Visitor', source: 'Friend' },
  { name: 'Lerato Dlamini', date: 'Sun 15 Jun', status: 'Contacted', source: 'Social Media' },
  { name: 'Sipho Nkosi', date: 'Sun 8 Jun', status: 'Follow-Up Scheduled', source: 'Walk-in' },
  { name: 'Nomsa Zulu', date: 'Sun 8 Jun', status: 'Attending Regularly', source: 'Family' },
];

const prayerRequests = [
  { name: 'Anonymous', category: 'Health', status: 'In Prayer', date: '14 Jun' },
  { name: 'John Sithole', category: 'Employment', status: 'New', date: '15 Jun' },
  { name: 'Mary Khumalo', category: 'Family', status: 'Assigned', date: '13 Jun' },
  { name: 'David Nkosi', category: 'Spiritual Growth', status: 'Answered', date: '10 Jun' },
];

const statusColors: Record<string, string> = {
  'New Visitor': 'bg-sky/10 text-sky border-sky/20',
  Contacted: 'bg-amber/10 text-amber-400 border-amber-400/20',
  'Follow-Up Scheduled': 'bg-purple-500/10 text-purple-400 border-purple-400/20',
  'Attending Regularly': 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20',
  New: 'bg-sky/10 text-sky border-sky/20',
  Assigned: 'bg-amber/10 text-amber-400 border-amber-400/20',
  'In Prayer': 'bg-purple-500/10 text-purple-400 border-purple-400/20',
  Answered: 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20',
};

export default function DashboardPage() {
  const [upcomingEvents, setUpcomingEvents] = useState<ChurchEvent[]>([]);

  useEffect(() => {
    getAdminEvents({ allCampuses: true }).then((e) => setUpcomingEvents(e.slice(0, 4)));
  }, []);

  return (
    <AppShell access="staff">
      <PageHeader
        personalized
        title="Church Dashboard"
        subtitle="Here's what's happening at your church today."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Members" value="342" change="+12 this month" icon="UsersIcon" />
        <StatCard label="New Visitors" value="18" change="+5 this week" icon="UserPlusIcon" />
        <StatCard label="Active Prayer Requests" value="27" change="4 answered" icon="HeartIcon" />
        <StatCard label="Upcoming Events" value="6" change="Next: Sunday Service" icon="CalendarDaysIcon" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ContentCard
          title="Recent Visitors"
          icon="UserPlusIcon"
          className="lg:col-span-2"
          action={
            <Link href="/visitors" className="text-xs font-medium text-ckc-gold hover:text-ckc-gold-light">
              View all →
            </Link>
          }
        >
          <div className="space-y-3">
            {recentVisitors.map((v) => (
              <div key={v.name} className="flex items-center justify-between border-b border-white/5 py-2 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-ckc-gold/10">
                    <span className="text-xs font-bold text-ckc-gold">{v.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-cloud">{v.name}</p>
                    <p className="text-xs text-cloud/40">
                      {v.date} · via {v.source}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusColors[v.status] || 'border-white/10 bg-white/5 text-cloud/50'}`}
                >
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        </ContentCard>

        <ContentCard
          title="Prayer Requests"
          icon="HeartIcon"
          action={
            <Link href="/prayer-requests" className="text-xs font-medium text-ckc-gold hover:text-ckc-gold-light">
              View all →
            </Link>
          }
        >
          <div className="space-y-3">
            {prayerRequests.map((pr) => (
              <div key={pr.name + pr.date} className="border-b border-white/5 py-2 last:border-0">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-medium text-cloud">{pr.name}</p>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusColors[pr.status] || 'border-white/10 bg-white/5 text-cloud/50'}`}
                  >
                    {pr.status}
                  </span>
                </div>
                <p className="text-xs text-cloud/40">
                  {pr.category} · {pr.date}
                </p>
              </div>
            ))}
          </div>
        </ContentCard>
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
              <p className="mt-1.5 text-xs font-medium text-emerald-400">{ev.rsvpCount} attending</p>
            </div>
          ))}
          {upcomingEvents.length === 0 && (
            <p className="text-xs text-cloud/40 col-span-full">No events yet — create one in Events.</p>
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
