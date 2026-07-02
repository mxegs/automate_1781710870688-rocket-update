'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { splitEventTitle } from '@/lib/events/title';
import { formatEventListDate } from '@/lib/events/utils';
import type { ChurchEvent } from '@/lib/events/types';

interface EventListRowProps {
  event: ChurchEvent;
  variant?: 'member' | 'admin';
  theme?: 'light' | 'dark';
  onEdit?: (event: ChurchEvent) => void;
  onDelete?: (event: ChurchEvent) => void;
  onRsvps?: (event: ChurchEvent) => void;
}

export default function EventListRow({
  event,
  variant = 'member',
  theme = 'light',
  onEdit,
  onDelete,
  onRsvps,
}: EventListRowProps) {
  const { day, month } = formatEventListDate(event.startsAt);
  const { lead, rest } = splitEventTitle(event.title);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isLight = theme === 'light';

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const cardClass = isLight
    ? 'rounded-xl border border-black/5 bg-ckc-card'
    : 'rounded-2xl border border-white/10 bg-white/[0.04]';

  const dateBorder = isLight ? 'border-white/10' : 'border-white/10';
  const actionButtonClass = isLight
    ? 'rounded-lg bg-white px-3 py-2 text-[11px] font-bold text-ckc-black hover:bg-ckc-white/90'
    : 'rounded-full bg-cloud px-4 py-2 text-xs font-bold text-ckc-black hover:bg-white transition-colors';

  return (
    <article className={`flex items-stretch overflow-hidden ${cardClass}`}>
      <div className={`flex w-[72px] shrink-0 flex-col items-center justify-center border-r ${dateBorder} px-2 py-4`}>
        <span className="font-serif-display text-2xl font-bold leading-none text-ckc-gold">{day}</span>
        <span className="mt-1 text-[11px] font-bold tracking-wider text-white">{month}</span>
      </div>

      <div className="flex min-w-0 flex-1 items-center px-4 py-3">
        <h3 className="font-bold leading-snug line-clamp-2">
          <span className="text-ckc-gold">{lead}</span>
          {rest ? <span className="text-white"> {rest}</span> : null}
        </h3>
      </div>

      <div className="relative flex shrink-0 items-center border-l border-white/10 px-3" ref={menuRef}>
        {variant === 'member' ? (
          <Link href={`/member/events/${event.id}`} className={actionButtonClass}>
            Details
          </Link>
        ) : (
          <>
            <button type="button" onClick={() => setMenuOpen((o) => !o)} className={actionButtonClass}>
              More
            </button>
            {menuOpen && (
              <div className="absolute right-3 top-full z-20 mt-2 min-w-[9.5rem] overflow-hidden rounded-xl border border-white/10 bg-ckc-card py-1 shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit?.(event);
                  }}
                  className="block w-full px-4 py-2.5 text-left text-xs text-white/80 hover:bg-white/5 hover:text-ckc-gold"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onRsvps?.(event);
                  }}
                  className="block w-full px-4 py-2.5 text-left text-xs text-white/80 hover:bg-white/5 hover:text-ckc-gold"
                >
                  RSVPs
                </button>
                <Link
                  href={`/events/${event.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="block w-full px-4 py-2.5 text-left text-xs text-white/80 hover:bg-white/5 hover:text-ckc-gold"
                >
                  Details
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete?.(event);
                  }}
                  className="block w-full px-4 py-2.5 text-left text-xs text-rose-400 hover:bg-ckc-gold/10"
                >
                  Delete
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
}
