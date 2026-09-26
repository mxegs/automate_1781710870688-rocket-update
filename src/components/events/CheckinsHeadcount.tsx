'use client';

import React from 'react';
import { getRoomMap } from '@/lib/events/rooms';
import type { EventCheckIn } from '@/lib/events/service';

export type CheckinsRoomFilter = 'all' | 'Adults' | string;

function bucket(row: EventCheckIn): string {
  if (row.isDependant && row.room) return row.room;
  return 'Adults';
}

export function checkinRoomBucket(row: EventCheckIn): string {
  return bucket(row);
}

export default function CheckinsHeadcount({
  rows,
  selected,
  onSelect,
}: {
  rows: EventCheckIn[];
  selected: CheckinsRoomFilter;
  onSelect: (next: CheckinsRoomFilter) => void;
}) {
  const rooms = getRoomMap().map((band) => band.room);
  const counts = new Map<string, number>();
  counts.set('all', rows.length);
  counts.set('Adults', 0);
  for (const room of rooms) counts.set(room, 0);
  for (const row of rows) {
    const key = bucket(row);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const pills: { id: CheckinsRoomFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    ...rooms.map((room) => ({ id: room, label: room })),
    { id: 'Adults', label: 'Adults' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {pills.map((pill) => {
        const active = selected === pill.id;
        return (
          <button
            key={pill.id}
            type="button"
            onClick={() => onSelect(pill.id)}
            className={
              active
                ? 'rounded-full bg-ckc-gold px-3 py-1.5 text-xs font-semibold text-ckc-black'
                : 'rounded-full border border-white/10 px-3 py-1.5 text-xs text-cloud/70'
            }
          >
            {pill.label} {counts.get(pill.id) ?? 0}
          </button>
        );
      })}
    </div>
  );
}
