'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
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

  return (
    <AppShell access="member">
      <div className="life-section">
        <h1 className="mb-2.5 text-base font-medium text-ckc-black">Announcements</h1>

        {usingDemo && (
          <p className="mb-2 text-[10px] text-ckc-muted">
            Sample announcements for preview — real posts from admin will replace these.
          </p>
        )}

        <input
          type="text"
          placeholder="Search announcements"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="life-input mb-3"
        />

        {pinned.length > 0 && (
          <div className="mb-3 space-y-2">
            {pinned.map((a) => (
              <AnnouncementCard key={a.id} ann={a} />
            ))}
          </div>
        )}

        <div className="space-y-2">
          {regular.map((a) => (
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
    <div className="rounded-lg border border-[#E5E5E5] p-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[9px] text-ckc-gold">{ann.date}</span>
        <span className="rounded border border-[#E5E5E5] px-1.5 py-0.5 text-[8px] text-ckc-muted">
          {ann.category}
        </span>
      </div>
      <h3 className="text-xs font-medium text-ckc-black">{ann.title}</h3>
      {ann.content ? (
        <p className="mt-1.5 whitespace-pre-wrap text-[11px] leading-relaxed text-[#555]">
          {ann.content}
        </p>
      ) : null}
    </div>
  );
}
