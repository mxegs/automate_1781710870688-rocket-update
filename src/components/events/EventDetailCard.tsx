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
    <article className={isLight ? 'bg-white' : 'overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]'}>
      {event.imageUrl ? (
        <div className="px-3.5 pt-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.imageUrl}
            alt={event.title}
            className={`w-full object-cover ${isLight ? 'h-[130px] rounded-[10px]' : 'aspect-video rounded-none'}`}
          />
        </div>
      ) : (
        <div className={`px-3.5 pt-2.5 ${isLight ? '' : ''}`}>
          <div
            className={`flex w-full items-center justify-center ${
              isLight ? 'h-[130px] rounded-[10px] bg-[#3a3a3a]' : 'aspect-video bg-white/5'
            }`}
          >
            <Icon name="CalendarDaysIcon" size={48} variant="outline" className="text-ckc-muted/40" />
          </div>
        </div>
      )}

      <div className="p-3.5">
        <h1 className={`text-base font-medium ${isLight ? 'text-ckc-black' : 'text-cloud'}`}>{event.title}</h1>

        <div className="mt-3">
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
