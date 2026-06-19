'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';

interface Announcement {
  id: number;
  title: string;
  content: string;
  category: string;
  date: string;
  expiryDate?: string;
  pinned: boolean;
  image?: string;
}

const mockAnnouncements: Announcement[] = [
  {
    id: 1,
    title: 'Youth Conference 2025 — Registration Now Open!',
    content: 'We are excited to announce that registration for Youth Conference 2025 is now open! This year\'s theme is "Rise Up" — three powerful days of worship, teaching, and encounters with God. Dates: 18–20 July 2025. Cost: R250 per person (includes meals). Register at the church office or speak to any youth leader.',
    category: 'Youth',
    date: '15 Jun 2025',
    expiryDate: '18 Jul 2025',
    pinned: true,
  },
  {
    id: 2,
    title: "Women's Day Celebration — 9 August 2025",
    content: "Join us for our annual Women's Day Celebration on Saturday, 9 August 2025 at 10:00 AM in the Main Auditorium. This year's theme: 'Women of Strength'. Guest speaker: Pastor Sarah Dlamini. Dress code: White and Gold. All women are warmly invited. Bring a friend!",
    category: "Women's Ministry",
    date: '12 Jun 2025',
    expiryDate: '9 Aug 2025',
    pinned: true,
  },
  {
    id: 3,
    title: 'New Bible Study Series Starting July',
    content: 'We are launching a new Bible Study series titled "Foundations of Faith" starting Wednesday, 2 July 2025 at 18:30 in the Fellowship Hall. This 8-week series will cover the core foundations of the Christian faith. All members are encouraged to attend. Study guides will be available at the church office.',
    category: 'Bible Study',
    date: '10 Jun 2025',
    pinned: false,
  },
  {
    id: 4,
    title: 'Sunday Service Time Change — Effective 6 July',
    content: 'Please note that from Sunday, 6 July 2025, our Sunday morning service will begin at 09:30 AM instead of 09:00 AM. The evening service remains at 18:00. Please update your calendars and inform your family members.',
    category: 'General',
    date: '8 Jun 2025',
    pinned: false,
  },
  {
    id: 5,
    title: 'Community Food Drive — Donations Needed',
    content: 'Our Outreach Team is collecting non-perishable food items for our monthly community food drive. Drop-off point: Church foyer. Items needed: canned goods, rice, pasta, cooking oil, and toiletries. Collection closes Sunday 29 June. Thank you for your generosity!',
    category: 'Outreach',
    date: '5 Jun 2025',
    expiryDate: '29 Jun 2025',
    pinned: false,
  },
  {
    id: 6,
    title: "Pastor's Message: Mid-Year Reflection",
    content: "As we reach the midpoint of 2025, I want to encourage every member of our church family. God has been faithful — in our services, our outreach, and in each of your personal journeys. Let us press forward with renewed faith and commitment. I look forward to seeing you this Sunday. — Pastor James Mokoena",
    category: 'Pastoral',
    date: '1 Jun 2025',
    pinned: false,
  },
];

const categoryColors: Record<string, string> = {
  'Youth': 'bg-purple-500/10 text-purple-400 border-purple-400/20',
  "Women's Ministry": 'bg-pink-500/10 text-pink-400 border-pink-400/20',
  'Bible Study': 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20',
  'General': 'bg-sky/10 text-sky border-sky/20',
  'Outreach': 'bg-amber-500/10 text-amber-400 border-amber-400/20',
  'Pastoral': 'bg-rose-500/10 text-rose-400 border-rose-400/20',
};

export default function MemberAnnouncementsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expanded, setExpanded] = useState<number | null>(null);

  const categories = ['All', ...Array.from(new Set(mockAnnouncements.map((a) => a.category)))];

  const filtered = mockAnnouncements.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || a.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const pinned = filtered.filter((a) => a.pinned);
  const regular = filtered.filter((a) => !a.pinned);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-cloud">Church Announcements</h1>
          <p className="text-cloud/40 text-sm mt-0.5">Stay up to date with what&apos;s happening at church</p>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Icon name="MagnifyingGlassIcon" size={15} variant="outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-cloud/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search announcements..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors"
            />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-cloud/70 focus:outline-none focus:border-sky/50 transition-colors">
            {categories.map((c) => <option key={c} value={c} className="bg-slate-800">{c === 'All' ? 'All Categories' : c}</option>)}
          </select>
        </div>

        {/* Pinned */}
        {pinned.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon name="BookmarkIcon" size={13} variant="solid" className="text-amber-400" />
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pinned</span>
            </div>
            {pinned.map((ann) => (
              <AnnouncementCard key={ann.id} ann={ann} expanded={expanded === ann.id} onToggle={() => setExpanded(expanded === ann.id ? null : ann.id)} />
            ))}
          </div>
        )}

        {/* Regular */}
        {regular.length > 0 && (
          <div className="space-y-3">
            {pinned.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-cloud/40 uppercase tracking-wider">All Announcements</span>
              </div>
            )}
            {regular.map((ann) => (
              <AnnouncementCard key={ann.id} ann={ann} expanded={expanded === ann.id} onToggle={() => setExpanded(expanded === ann.id ? null : ann.id)} />
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Icon name="MegaphoneIcon" size={32} variant="outline" className="text-cloud/20 mx-auto mb-3" />
            <p className="text-cloud/40 text-sm">No announcements found.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function AnnouncementCard({ ann, expanded, onToggle }: { ann: Announcement; expanded: boolean; onToggle: () => void }) {
  const catColor = categoryColors[ann.category] || 'bg-white/5 text-cloud/40 border-white/10';
  return (
    <div className={`bg-white/5 border rounded-2xl overflow-hidden transition-all ${ann.pinned ? 'border-amber-400/20' : 'border-white/10'} hover:border-sky/20`}>
      <button onClick={onToggle} className="w-full text-left p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {ann.pinned && <Icon name="BookmarkIcon" size={12} variant="solid" className="text-amber-400 flex-shrink-0" />}
              <span className={`text-xs px-2 py-0.5 rounded-full border ${catColor}`}>{ann.category}</span>
              <span className="text-xs text-cloud/30">{ann.date}</span>
              {ann.expiryDate && <span className="text-xs text-cloud/30">· Expires {ann.expiryDate}</span>}
            </div>
            <h3 className="text-cloud font-semibold text-sm leading-snug">{ann.title}</h3>
            {!expanded && <p className="text-cloud/40 text-xs mt-1.5 line-clamp-2">{ann.content}</p>}
          </div>
          <Icon name={expanded ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={16} variant="outline" className="text-cloud/30 flex-shrink-0 mt-0.5" />
        </div>
      </button>
      {expanded && (
        <div className="px-5 pb-5">
          <div className="h-px bg-white/5 mb-4" />
          <p className="text-cloud/70 text-sm leading-relaxed whitespace-pre-line">{ann.content}</p>
        </div>
      )}
    </div>
  );
}
