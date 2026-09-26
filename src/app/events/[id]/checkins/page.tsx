'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import CheckinsHeadcount, {
  checkinRoomBucket,
  type CheckinsRoomFilter,
} from '@/components/events/CheckinsHeadcount';
import CheckinsList, { type MemberName } from '@/components/events/CheckinsList';
import { getEventById, getEventCheckins, type EventCheckIn } from '@/lib/events/service';
import { getMembers } from '@/lib/members/service';
import { resolveMemberChurch } from '@/lib/member/campus';
import type { ChurchEvent } from '@/lib/events/types';

function matchesSearch(row: EventCheckIn, names: Map<string, MemberName>, needle: string): boolean {
  if (!needle) return true;
  const adult = row.memberId ? names.get(row.memberId) : undefined;
  const guardian = row.guardianMemberId ? names.get(row.guardianMemberId) : undefined;
  const haystack = [
    row.dependantName,
    row.room,
    row.securityCode,
    adult?.fullName,
    adult?.surname,
    guardian?.fullName,
    guardian?.surname,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle);
}

export default function StaffEventCheckinsPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [event, setEvent] = useState<ChurchEvent | null>(null);
  const [rows, setRows] = useState<EventCheckIn[]>([]);
  const [names, setNames] = useState<Map<string, MemberName>>(new Map());
  const [loading, setLoading] = useState(true);
  const [roomFilter, setRoomFilter] = useState<CheckinsRoomFilter>('all');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    const churchId = resolveMemberChurch();
    const [loaded, checkins, members] = await Promise.all([
      getEventById(eventId, churchId).catch(() => null),
      getEventCheckins(eventId, churchId).catch(() => [] as EventCheckIn[]),
      getMembers({ status: 'active', churchId }).catch(() => []),
    ]);
    const map = new Map<string, MemberName>();
    for (const member of members) {
      map.set(member.id, {
        fullName: member.fullName,
        surname: member.surname,
        campusId: member.campusId,
        age: member.age,
        phone: member.phone,
      });
    }
    setEvent(loaded);
    setRows(checkins);
    setNames(map);
  }, [eventId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    load().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (roomFilter !== 'all' && checkinRoomBucket(row) !== roomFilter) return false;
      return matchesSearch(row, names, needle);
    });
  }, [rows, names, roomFilter, search]);

  if (loading) {
    return (
      <AppShell access="staff">
        <p className="py-12 text-center text-cloud/40">Loading check-ins…</p>
      </AppShell>
    );
  }

  if (!event) {
    return (
      <AppShell access="staff">
        <div className="py-12 text-center">
          <p className="text-cloud/60">Event not found</p>
          <Link href="/events" className="mt-2 inline-block text-sm text-ckc-gold">
            ← Back to events
          </Link>
        </div>
      </AppShell>
    );
  }

  const emptyLabel =
    rows.length === 0 ? 'No check-ins yet for this event' : 'No matching check-ins';

  return (
    <AppShell access="staff">
      <div className="mx-auto max-w-lg">
        <Link
          href={`/events/${event.id}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-cloud/50 hover:text-ckc-gold"
        >
          <Icon name="ArrowLeftIcon" size={14} variant="outline" />
          Back to event
        </Link>

        <div className="mb-4 flex items-start justify-between gap-3">
          <h1 className="font-serif text-2xl font-semibold text-cloud">{event.title}</h1>
          <button
            type="button"
            onClick={() => load()}
            className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-xs text-cloud/70"
          >
            Refresh
          </button>
        </div>

        <CheckinsHeadcount rows={rows} selected={roomFilter} onSelect={setRoomFilter} />

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or code"
          className="mt-4 mb-6 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-cloud placeholder:text-cloud/30"
        />

        <CheckinsList rows={visible} names={names} selected={roomFilter} emptyLabel={emptyLabel} />
      </div>
    </AppShell>
  );
}
