'use client';

import React from 'react';
import Link from 'next/link';

type CheckInHeroState = 'ready' | 'checked-in' | 'ended';

export default function CheckInHero({
  eventTitle,
  campusLabel,
  timeLabel,
  href,
  state,
  seat,
  kidsRoom,
  securityCode,
}: {
  eventTitle: string;
  campusLabel: string;
  timeLabel: string;
  href: string;
  state: CheckInHeroState;
  seat?: string;
  kidsRoom?: string;
  securityCode?: string;
}) {
  return (
    <Link href={href} className="relative block overflow-hidden rounded-[28px] bg-ckc-black">
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-ckc-gold/20" />
      <div className="relative flex min-h-[280px] flex-col justify-end p-5">
        {state === 'checked-in' ? (
          <span className="absolute right-4 top-4 rounded-full bg-ckc-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ckc-gold-text">
            Checked in
          </span>
        ) : null}
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ckc-gold">{campusLabel}</p>
        <h2 className="mt-2 font-serif text-[26px] font-semibold leading-tight text-cloud">{eventTitle}</h2>
        <p className="mt-1 text-sm text-cloud/80">{timeLabel}</p>

        {state === 'ready' ? (
          <span className="mt-4 inline-flex w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold text-ckc-black">
            Check in now
          </span>
        ) : null}

        {state === 'checked-in' ? (
          <div className="mt-4 space-y-1 text-sm text-cloud">
            {seat ? <p>Seat {seat}</p> : null}
            {kidsRoom ? <p>Kids room {kidsRoom}</p> : null}
            {securityCode ? (
              <p className="pt-1 font-mono text-3xl font-bold tracking-[0.2em] text-ckc-gold">{securityCode}</p>
            ) : null}
          </div>
        ) : null}

        {state === 'ended' ? (
          <p className="mt-4 text-sm font-medium text-cloud">Service ended — watch the replay</p>
        ) : null}
      </div>
    </Link>
  );
}
