'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import LifeHero from '@/components/church-life/LifeHero';
import { LIFE_PHOTOS, lifeImageFor } from '@/lib/church-life/imagery';
import { getMemberAnnouncements } from '@/lib/announcements/service';
import { resolveMemberCampus } from '@/lib/member/campus';
import { getSession } from '@/lib/auth/session';
import type { Announcement } from '@/lib/announcements/types';

/** Sample posts so the page is readable when the DB has none yet */
const DEMO_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'demo-welcome',
    title: 'Welcome to Church Life',
    content:
      'We are glad you are here. Check this space for weekly updates, service notes, and church family news from your campus.',
    category: 'General',
    campus: 'midrand',
    visibility: 'members_only',
    status: 'published',
    pinned: true,
    repeatInterval: 'none',
    date: new Date().toISOString().slice(0, 10),
  },
  {
    id: 'demo-sunday',
    title: 'This Sunday',
    content:
      'Join us for worship this Sunday. Arrive a few minutes early, bring a friend, and stay after for fellowship.',
    category: 'Events',
    campus: 'midrand',
    visibility: 'members_only',
    status: 'published',
    pinned: false,
    repeatInterval: 'none',
    date: new Date().toISOString().slice(0, 10),
  },
];

export default function MemberAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [usingDemo, setUsingDemo] = useState(false);
  const [search, setSearch] = useState('');
  const session = getSession();
  const isVisitor = session?.role === 'visitor';

  useEffect(() => {
    (async () => {
      try {
        const campus = await resolveMemberCampus();
        const list = await getMemberAnnouncements({ memberCampus: campus, isVisitor });
        if (list.length > 0) {
          setAnnouncements(list);
          setUsingDemo(false);
        } else {
          setAnnouncements(DEMO_ANNOUNCEMENTS);
          setUsingDemo(true);
        }
      } catch {
        setAnnouncements(DEMO_ANNOUNCEMENTS);
        setUsingDemo(true);
      }
    })();
  }, [isVisitor]);

  const filtered = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase()),
  );

  const pinned = filtered.filter((a) => a.pinned);
  const regular = filtered.filter((a) => !a.pinned);
  const featured = pinned[0] ?? regular[0];

  return (
    <AppShell access="member">
      <div className="px-5 pb-8 pt-5">
        <h1 className="font-serif text-[32px] font-semibold leading-none text-ckc-black">Announcements</h1>
        <p className="mt-1 text-sm text-ckc-muted">News from your campus family</p>

        {featured ? (
          <div className="mt-5">
            <LifeHero
              imageUrl={lifeImageFor(featured.id)}
              titleLead={featured.title}
              titleRest={featured.content.slice(0, 90)}
              badge={featured.pinned ? 'Pinned' : featured.category}
            />
          </div>
        ) : (
          <div className="mt-5">
            <LifeHero imageUrl={LIFE_PHOTOS.community} titleLead="Stay in the loop" titleRest="Campus news will appear here" />
          </div>
        )}

        {usingDemo && (
          <p className="mt-3 text-xs text-ckc-muted">Sample announcements for preview — real posts from admin will replace these.</p>
        )}

        <input
          type="search"
          placeholder="Search announcements"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="life-input mt-4"
        />

        <div className="mt-5 space-y-3">
          {filtered
            .filter((a) => a.id !== featured?.id)
            .map((a) => (
              <AnnouncementCard key={a.id} ann={a} />
            ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-12 text-center text-ckc-muted">No announcements for your campus yet.</p>
        )}
      </div>
    </AppShell>
  );
}

function AnnouncementCard({ ann }: { ann: Announcement }) {
  return (
    <article className="overflow-hidden rounded-[22px] bg-white shadow-[0_10px_28px_rgba(26,22,18,0.08)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={lifeImageFor(ann.id)} alt="" className="h-[140px] w-full object-cover" />
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ckc-gold-dim">{ann.date}</span>
          <span className="rounded-full bg-[#F7F3EE] px-2.5 py-1 text-[11px] font-medium text-ckc-muted">{ann.category}</span>
        </div>
        <h3 className="text-[17px] font-semibold text-ckc-black">{ann.title}</h3>
        {ann.content ? (
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#3F392F]">{ann.content}</p>
        ) : null}
      </div>
    </article>
  );
}
