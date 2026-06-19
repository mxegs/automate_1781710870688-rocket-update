'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-cloud">Announcements</h1>
        <p className="text-cloud/40 text-sm mt-0.5">Campus updates & announcements</p>
      </div>

      <div className="relative mb-6">
        <Icon name="MagnifyingGlassIcon" size={16} variant="outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-cloud/30" />
        <input
          type="text"
          placeholder="Search announcements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-cloud"
        />
      </div>

      {pinned.length > 0 && (
        <div className="mb-6 space-y-3">
          <h2 className="text-xs font-semibold text-cloud/50 uppercase">Pinned</h2>
          {pinned.map((a) => (
            <AnnouncementCard key={a.id} ann={a} />
          ))}
        </div>
      )}

      <div className="space-y-3">
        {regular.map((a) => (
          <AnnouncementCard key={a.id} ann={a} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-cloud/40 py-12">No announcements for your campus yet.</p>
      )}
    </AppShell>
  );
}

function AnnouncementCard({ ann }: { ann: Announcement }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] font-semibold uppercase text-ckc-gold">{ann.category}</span>
          <h3 className="font-bold text-cloud mt-1">{ann.title}</h3>
        </div>
        {ann.pinned && <Icon name="BookmarkIcon" size={14} variant="solid" className="text-ckc-gold shrink-0" />}
      </div>
      <p className="text-sm text-cloud/60 mt-2 leading-relaxed">{ann.content}</p>
      <p className="text-xs text-cloud/30 mt-2">{ann.date}{ann.authorName ? ` · ${ann.authorName}` : ''}</p>
    </div>
  );
}
