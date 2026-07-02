'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import EventDetailSections from '@/components/events/EventDetailSections';
import EventDetailFooter from '@/components/events/EventDetailFooter';
import type { ChurchEvent } from '@/lib/events/types';

interface EventDetailCardProps {
  event: ChurchEvent;
  onAction: () => void;
  onShare: () => void;
  onSecondary?: () => void;
  theme?: 'light' | 'dark';
}

/** Single-event layout: image, title, sections, and inline footer actions in one card. */
export default function EventDetailCard({
  event,
  onAction,
  onShare,
  onSecondary,
  theme = 'light',
}: EventDetailCardProps) {
  const isLight = theme === 'light';

  return (
    <article
      className={
        isLight
          ? 'overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white'
          : 'overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]'
      }
    >
      {event.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={event.imageUrl} alt={event.title} className="aspect-video w-full object-cover" />
      ) : (
        <div
          className={`flex aspect-video w-full items-center justify-center ${isLight ? 'bg-neutral-100' : 'bg-white/5'}`}
        >
          <Icon name="CalendarDaysIcon" size={48} variant="outline" className="text-ckc-muted/40" />
        </div>
      )}

      <div className="p-5">
        <h1 className={`text-2xl font-bold ${isLight ? 'text-ckc-black' : 'text-cloud'}`}>{event.title}</h1>

        <div className="mt-5">
          <EventDetailSections event={event} theme={theme} />
        </div>

        <EventDetailFooter
          event={event}
          onAction={onAction}
          onShare={onShare}
          onSecondary={onSecondary}
          theme={theme}
        />
      </div>
    </article>
  );
}
