'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string;
  color: string;
}

const stats: StatCardProps[] = [
  { label: 'Total Members', value: '342', change: '+12 this month', positive: true, icon: 'UsersIcon', color: 'sky' },
  { label: 'New Visitors', value: '18', change: '+5 this week', positive: true, icon: 'UserPlusIcon', color: 'emerald' },
  { label: 'Active Prayer Requests', value: '27', change: '4 answered', positive: true, icon: 'HeartIcon', color: 'rose' },
  { label: 'Upcoming Events', value: '6', change: 'Next: Sunday Service', positive: true, icon: 'CalendarDaysIcon', color: 'amber' },
];

const recentVisitors = [
  { name: 'Thabo Mokoena', date: 'Sun 15 Jun', status: 'New Visitor', source: 'Friend' },
  { name: 'Lerato Dlamini', date: 'Sun 15 Jun', status: 'Contacted', source: 'Social Media' },
  { name: 'Sipho Nkosi', date: 'Sun 8 Jun', status: 'Follow-Up Scheduled', source: 'Walk-in' },
  { name: 'Nomsa Zulu', date: 'Sun 8 Jun', status: 'Attending Regularly', source: 'Family' },
];

const upcomingEvents = [
  { name: 'Sunday Service', date: 'Sun 22 Jun', time: '09:00', type: 'Sunday Service', rsvp: 180 },
  { name: 'Youth Night', date: 'Fri 20 Jun', time: '18:30', type: 'Youth Event', rsvp: 45 },
  { name: "Women\'s Prayer", date: 'Sat 21 Jun', time: '08:00', type: 'Prayer Meeting', rsvp: 32 },
  { name: "Men\'s Breakfast", date: 'Sat 28 Jun', time: '07:30', type: "Men\'s Ministry", rsvp: 28 },
];

const prayerRequests = [
  { name: 'Anonymous', category: 'Health', status: 'In Prayer', date: '14 Jun' },
  { name: 'John Sithole', category: 'Employment', status: 'New', date: '15 Jun' },
  { name: 'Mary Khumalo', category: 'Family', status: 'Assigned', date: '13 Jun' },
  { name: 'David Nkosi', category: 'Spiritual Growth', status: 'Answered', date: '10 Jun' },
];

const statusColors: Record<string, string> = {
  'New Visitor': 'bg-sky/10 text-sky border-sky/20',
  'Contacted': 'bg-amber/10 text-amber-400 border-amber-400/20',
  'Follow-Up Scheduled': 'bg-purple-500/10 text-purple-400 border-purple-400/20',
  'Attending Regularly': 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20',
  'New': 'bg-sky/10 text-sky border-sky/20',
  'Assigned': 'bg-amber/10 text-amber-400 border-amber-400/20',
  'In Prayer': 'bg-purple-500/10 text-purple-400 border-purple-400/20',
  'Answered': 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20',
};

const iconColors: Record<string, string> = {
  sky: 'bg-sky/10 text-sky',
  emerald: 'bg-emerald-500/10 text-emerald-400',
  rose: 'bg-rose-500/10 text-rose-400',
  amber: 'bg-amber-500/10 text-amber-400',
};

export default function DashboardPage() {
  const [greeting, setGreeting] = React.useState('Good morning');

  React.useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good morning');
    else if (h < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-8">
        <p className="text-cloud/40 text-sm font-medium mb-1">{greeting}</p>
        <h1 className="text-2xl md:text-3xl font-bold text-cloud tracking-tight">Church Dashboard</h1>
        <p className="text-cloud/50 text-sm mt-1">Here&apos;s what&apos;s happening at your church today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-sky/30 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconColors[stat.color]}`}>
                <Icon name={stat.icon} size={18} variant="outline" />
              </div>
            </div>
            <p className="text-2xl font-bold text-cloud font-mono">{stat.value}</p>
            <p className="text-xs text-cloud/50 mt-0.5">{stat.label}</p>
            <p className={`text-xs mt-1.5 font-medium ${stat.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Visitors */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-cloud">Recent Visitors</h2>
            <Link href="/visitors" className="text-xs text-sky hover:text-sky/80 transition-colors font-medium">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentVisitors.map((v) => (
              <div key={v.name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-sky/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-sky">{v.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-cloud">{v.name}</p>
                    <p className="text-xs text-cloud/40">{v.date} · via {v.source}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[v.status] || 'bg-white/5 text-cloud/50 border-white/10'}`}>
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Prayer Requests */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-cloud">Prayer Requests</h2>
            <Link href="/prayer-requests" className="text-xs text-sky hover:text-sky/80 transition-colors font-medium">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {prayerRequests.map((pr) => (
              <div key={pr.name + pr.date} className="py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-cloud">{pr.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[pr.status] || 'bg-white/5 text-cloud/50 border-white/10'}`}>
                    {pr.status}
                  </span>
                </div>
                <p className="text-xs text-cloud/40">{pr.category} · {pr.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-cloud">Upcoming Events</h2>
          <Link href="/events" className="text-xs text-sky hover:text-sky/80 transition-colors font-medium">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {upcomingEvents.map((ev) => (
            <div key={ev.name} className="bg-white/5 border border-white/10 rounded-lg p-3 hover:border-sky/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-md bg-sky/10 flex items-center justify-center">
                  <Icon name="CalendarDaysIcon" size={14} variant="outline" className="text-sky" />
                </div>
                <span className="text-xs text-cloud/40 font-medium">{ev.type}</span>
              </div>
              <p className="text-sm font-semibold text-cloud mb-1">{ev.name}</p>
              <p className="text-xs text-cloud/50">{ev.date} at {ev.time}</p>
              <p className="text-xs text-emerald-400 mt-1.5 font-medium">{ev.rsvp} attending</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Add Member', href: '/members', icon: 'UserPlusIcon' },
          { label: 'Register Visitor', href: '/visitors', icon: 'ClipboardDocumentListIcon' },
          { label: 'New Event', href: '/events', icon: 'CalendarDaysIcon' },
          { label: 'Prayer Request', href: '/prayer-requests', icon: 'HeartIcon' },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-lg px-4 py-3 hover:bg-sky/5 hover:border-sky/30 transition-all group"
          >
            <Icon name={action.icon} size={16} variant="outline" className="text-sky" />
            <span className="text-sm font-medium text-cloud/70 group-hover:text-cloud transition-colors">{action.label}</span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
