'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { getMemberAnnouncements } from '@/lib/announcements/service';
import { resolveMemberCampus } from '@/lib/member/campus';
import { getSession } from '@/lib/auth/session';
import type { Announcement } from '@/lib/announcements/types';

export default function MemberAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [search, setSearch] = useState('');
  const session = getSession();
  const isVisitor = session?.role === 'visitor';

  useEffect(() => {
    (async () => {
      const campus = await resolveMemberCampus();
      setAnnouncements(await getMemberAnnouncements({ memberCampus: campus, isVisitor }));
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
    <AppShell access="shared">
      <div className="life-section">
        <h1 className="mb-2.5 text-base font-medium text-ckc-black">Announcements</h1>

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
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[9px] text-ckc-gold">{ann.date}</span>
        <span className="rounded border border-[#E5E5E5] px-1.5 py-0.5 text-[8px] text-ckc-muted">
          {ann.category}
        </span>
      </div>
      <h3 className="text-xs font-medium text-ckc-black">{ann.title}</h3>
    </div>
  );
}
