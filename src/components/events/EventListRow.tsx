'use client';

import React from 'react';
import Link from 'next/link';
import { formatEventListDate } from '@/lib/events/utils';
import type { ChurchEvent } from '@/lib/events/types';

interface EventListRowProps {
  event: ChurchEvent;
}

export default function EventListRow({ event }: EventListRowProps) {
  const { day, month } = formatEventListDate(event.startsAt);

  return (
    <article className="flex items-stretch overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
      <div className="flex w-[72px] shrink-0 flex-col items-center justify-center border-r border-white/10 px-2 py-4">
        <span className="text-2xl font-bold leading-none text-cloud">{day}</span>
        <span className="mt-1 text-[11px] font-bold tracking-wider text-cloud/60">{month}</span>
      </div>

      <div className="flex min-w-0 flex-1 items-center px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ckc-gold">{event.category}</p>
          <h3 className="mt-0.5 font-bold text-cloud leading-snug line-clamp-2">{event.title}</h3>
        </div>
      </div>

      <div className="flex shrink-0 items-center border-l border-white/10 px-3">
        <Link
          href={`/member/events/${event.id}`}
          className="rounded-full bg-cloud px-4 py-2 text-xs font-bold text-ckc-black hover:bg-white transition-colors"
        >
          Details
        </Link>
      </div>
    </article>
  );
}
