'use client';

import React from 'react';
import { getRoomMap } from '@/lib/events/rooms';
import type { EventCheckIn } from '@/lib/events/service';
import { checkinRoomBucket, type CheckinsRoomFilter } from '@/components/events/CheckinsHeadcount';
import { staffDisambiguators } from '@/lib/members/disambiguate';

export type MemberName = {
  fullName: string;
  surname: string;
  campusId?: string | null;
  age?: number | null;
  phone?: string | null;
};

function memberDisplayName(entry: MemberName | undefined, fallback: string): string {
  if (!entry) return fallback;
  const full = entry.fullName.trim();
  const surname = entry.surname.trim();
  if (!full) return surname || fallback;
  if (!surname) return full;
  const compact = full.replace(/\s+/g, ' ').toLowerCase();
  const sur = surname.toLowerCase();
  if (compact === sur || compact.endsWith(` ${sur}`)) return full;
  return `${full} ${surname}`;
}

function adultName(row: EventCheckIn, names: Map<string, MemberName>): string {
  const entry = row.memberId ? names.get(row.memberId) : undefined;
  return memberDisplayName(entry, 'Adult');
}

function guardianName(row: EventCheckIn, names: Map<string, MemberName>): string {
  const entry = row.guardianMemberId ? names.get(row.guardianMemberId) : undefined;
  return memberDisplayName(entry, '');
}

function groupOrder(): string[] {
  return [...getRoomMap().map((band) => band.room), 'Adults'];
}

export default function CheckinsList({
  rows,
  names,
  selected,
  emptyLabel,
}: {
  rows: EventCheckIn[];
  names: Map<string, MemberName>;
  selected: CheckinsRoomFilter;
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-cloud/40">{emptyLabel}</p>;
  }

  const grouped = new Map<string, EventCheckIn[]>();
  for (const heading of groupOrder()) grouped.set(heading, []);
  for (const row of rows) {
    const key = checkinRoomBucket(row);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(row);
  }

  const sections = [...grouped.entries()].filter(([heading, list]) => {
    if (list.length > 0) return true;
    return selected !== 'all' && selected === heading;
  });

  return (
    <div className="space-y-6">
      {sections.map(([heading, list]) => (
        <section key={heading}>
          <h3 className="mb-2 font-serif text-sm font-semibold text-ckc-gold">{heading}</h3>
          {list.length === 0 ? (
            <p className="text-sm text-cloud/40">No check-ins in this room</p>
          ) : (
            <ul className="space-y-2">
              {list.map((row) => {
                const isKid = row.isDependant;
                const name = isKid ? row.dependantName || 'Child' : adultName(row, names);
                const guardian = isKid ? guardianName(row, names) : '';
                const person = isKid
                  ? row.guardianMemberId
                    ? names.get(row.guardianMemberId)
                    : undefined
                  : row.memberId
                    ? names.get(row.memberId)
                    : undefined;
                const extra = staffDisambiguators({
                  campusId: person?.campusId,
                  age: person?.age,
                  phone: person?.phone,
                });
                return (
                  <li
                    key={row.id}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-cloud"
                  >
                    <span>{name}</span>
                    {isKid && row.room ? <span className="text-cloud/50"> · {row.room}</span> : null}
                    {guardian ? <span className="text-cloud/50"> · {guardian}</span> : null}
                    {extra ? <span className="text-cloud/50"> · {extra}</span> : null}
                    {row.securityCode ? (
                      <span className="font-mono text-ckc-gold"> · {row.securityCode}</span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
