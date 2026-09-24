'use client';

import LifePhoto from '@/components/church-life/LifePhoto';
import { eventCover } from '@/lib/church-life/imagery';
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
      <div className={isLight ? 'overflow-hidden rounded-[24px]' : ''}>
        <LifePhoto
          src={eventCover(event)}
          alt={event.title}
          className={`w-full object-cover ${isLight ? 'h-[220px]' : 'aspect-video rounded-none'}`}
        />
      </div>

      <div className="p-3.5">
        <h1 className={`font-serif text-[26px] font-semibold leading-tight ${isLight ? 'text-ckc-black' : 'text-cloud'}`}>
          {event.title}
        </h1>

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
