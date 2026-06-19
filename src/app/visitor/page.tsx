'use client';

import React from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import { BRAND } from '@/lib/assets';

const visitorLinks = [
  { label: 'Sermons & Messages', href: '/member/sermons', icon: 'PlayCircleIcon', desc: 'Watch recent messages' },
  { label: 'Upcoming Events', href: '/member/events', icon: 'CalendarDaysIcon', desc: 'See what is happening' },
  { label: 'Church Info', href: '/member/church-info', icon: 'BuildingLibraryIcon', desc: 'Service times & location' },
  { label: 'Daily Word', href: '/member/bible-study', icon: 'BookOpenIcon', desc: "Today's devotional" },
];

export default function VisitorHomePage() {
  return (
    <AppShell access="visitor">
      <div>
        <span className="inline-block rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-ckc-gold border border-ckc-gold/30 bg-ckc-gold/5">
          Visitor Access
        </span>
        <h1 className="mt-2 text-2xl font-bold text-cloud tracking-tight">{BRAND.name}</h1>
        <p className="text-cloud/40 text-sm mt-1">Welcome — explore our church resources</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visitorLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-start gap-3 p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-ckc-gold/30 hover:bg-ckc-gold/5 transition-all group"
          >
            <div className="p-2 rounded-lg bg-ckc-gold/10 border border-ckc-gold/20">
              <Icon name={item.icon} size={20} variant="outline" className="text-ckc-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold text-cloud group-hover:text-ckc-gold transition-colors">{item.label}</p>
              <p className="text-xs text-cloud/40 mt-0.5">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
        <p className="text-xs text-cloud/40 mb-3">Want full member access?</p>
        <p className="text-xs text-cloud/60">Ask your church admin for an invite, or call {BRAND.supportPhone}</p>
      </div>
    </AppShell>
  );
}
