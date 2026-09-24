'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import LifePhoto from '@/components/church-life/LifePhoto';
import { eventCover } from '@/lib/church-life/imagery';
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

  if (variant === 'member' && isLight) {
    return (
      <Link
        href={`/member/events/${event.id}`}
        className="flex overflow-hidden rounded-[22px] bg-white shadow-[0_10px_28px_rgba(26,22,18,0.08)]"
      >
        <LifePhoto src={eventCover(event)} className="h-[104px] w-[104px] shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ckc-gold-dim">
            {day} {month} · {event.time}
          </p>
          <p className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-ckc-black">{event.title}</p>
          <p className="mt-1 truncate text-xs text-ckc-muted">{event.location || event.category}</p>
        </div>
      </Link>
    );
  }

  const cardClass = isLight
    ? 'rounded-xl bg-white border border-[#E5E5E5]'
    : 'rounded-2xl border border-white/10 bg-white/[0.04]';

  const dateBorder = isLight ? 'border-[#c7c5d3]/70' : 'border-white/10';
  const actionButtonClass = isLight
    ? 'rounded-lg bg-ckc-gold-button px-2.5 py-1.5 text-[10px] font-semibold text-ckc-gold-text hover:bg-ckc-gold'
    : 'rounded-full bg-ckc-gold-button px-4 py-2 text-xs font-bold text-white hover:bg-ckc-gold transition-colors';

  return (
    <article className={`flex items-center gap-2.5 overflow-hidden p-3 ${cardClass}`}>
      <div className={`flex shrink-0 flex-col items-center border-r pr-2.5 ${dateBorder}`}>
        <span className="font-serif-display text-xl font-normal leading-none text-ckc-gold">{day}</span>
        <span className="mt-0.5 text-[9px] font-medium uppercase text-ckc-muted">{month}</span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-xs leading-snug">
          <span className="text-ckc-gold">{lead}</span>
          {rest ? <span className="font-medium text-ckc-black"> {rest}</span> : null}
        </h3>
      </div>

      <div className="relative shrink-0" ref={menuRef}>
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
                  className="block w-full px-4 py-2.5 text-left text-xs text-ckc-muted hover:bg-ckc-surface hover:text-ckc-gold"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onRsvps?.(event);
                  }}
                  className="block w-full px-4 py-2.5 text-left text-xs text-ckc-muted hover:bg-ckc-surface hover:text-ckc-gold"
                >
                  RSVPs
                </button>
                <Link
                  href={`/events/${event.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="block w-full px-4 py-2.5 text-left text-xs text-ckc-muted hover:bg-ckc-surface hover:text-ckc-gold"
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
