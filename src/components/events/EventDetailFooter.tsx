'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import { formatPrice } from '@/lib/events/utils';
import type { ChurchEvent } from '@/lib/events/types';

interface EventDetailFooterProps {
  event: ChurchEvent;
  onAction: () => void;
  onShare: () => void;
}

/** Sticky bottom bar — RSVP for free events, Continue Booking for paid. */
export default function EventDetailFooter({ event, onAction, onShare }: EventDetailFooterProps) {
  const isPaid = Boolean(event.isPaid && event.priceCents);
  const actionLabel = isPaid ? 'Continue Booking' : 'R S V P';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-ckc-black/95 backdrop-blur-md px-4 py-3">
      <div className="mx-auto flex max-w-lg items-center gap-2">
        <button
          type="button"
          onClick={onAction}
          className={`flex-1 rounded-xl bg-cloud py-3.5 text-sm font-bold text-ckc-black hover:bg-white transition-colors ${
            isPaid ? '' : 'tracking-[0.35em] uppercase pl-[0.35em]'
          }`}
        >
          {actionLabel}
        </button>
        <button
          type="button"
          onClick={onShare}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cloud/60 hover:border-ckc-gold/30 hover:text-ckc-gold"
          aria-label="Share event"
        >
          <Icon name="ShareIcon" size={18} variant="outline" />
        </button>
      </div>
    </div>
  );
}

export function EventEntryBar({ event }: { event: ChurchEvent }) {
  const isPaid = Boolean(event.isPaid && event.priceCents);

  return (
    <div className="border-t border-white/10 py-5 mt-2">
      {isPaid ? (
        <>
          <p className="text-3xl font-bold text-cloud">{formatPrice(event.priceCents!, event.currency)}</p>
          <p className="text-xs text-cloud/40 mt-1">per person</p>
        </>
      ) : (
        <p className="text-base font-bold tracking-[0.25em] text-cloud uppercase">Free Entry</p>
      )}
    </div>
  );
}
