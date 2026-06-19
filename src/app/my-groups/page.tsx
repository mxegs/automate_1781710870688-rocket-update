'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import PageHeader, { ContentCard } from '@/components/portal/PageHeader';
import { getGroupsLedBy } from '@/lib/groups/service';
import { getCampusLabel } from '@/lib/church/constants';
import { getSession } from '@/lib/auth/session';
import type { ChurchGroup } from '@/lib/groups/types';

export default function MyGroupsPage() {
  const [groups, setGroups] = useState<ChurchGroup[]>([]);
  const [displayName, setDisplayName] = useState('Leader');

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    setDisplayName(session.displayName || session.username || 'Leader');
    getGroupsLedBy(session.phone).then(setGroups);
  }, []);

  return (
    <AppShell access="group-leader">
      <PageHeader
        personalized
        title="My Groups"
        subtitle={`Groups you lead — send broadcasts & manage your team, ${displayName}`}
      />

      {groups.length === 0 ? (
        <ContentCard>
          <div className="py-8 text-center">
            <Icon name="UserGroupIcon" size={32} variant="outline" className="mx-auto mb-3 text-cloud/20" />
            <p className="text-sm text-cloud/50">No groups assigned to you yet</p>
            <p className="mt-1 text-xs text-cloud/30">Your admin or pastor will assign you as a group leader.</p>
          </div>
        </ContentCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((g) => (
            <Link
              key={g.id}
              href={`/my-groups/${g.id}`}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-ckc-gold/30 hover:bg-ckc-gold/5"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ckc-gold">
                {g.category === 'ministry' ? 'Ministry' : 'Group'} · {getCampusLabel(g.campus)}
              </span>
              <h3 className="mt-1 text-base font-bold text-cloud">{g.name}</h3>
              <p className="mt-2 text-xs text-cloud/40">{g.memberPhones.length} members</p>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
