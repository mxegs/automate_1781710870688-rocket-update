'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import { formatPrice } from '@/lib/events/utils';
import type { ChurchEvent } from '@/lib/events/types';

interface EventDetailFooterProps {
  event: ChurchEvent;
  onAction: () => void;
  onShare: () => void;
  onSecondary?: () => void;
  theme?: 'light' | 'dark';
}

/** Inline bottom actions — not sticky. */
export default function EventDetailFooter({
  event,
  onAction,
  onShare,
  onSecondary,
  theme = 'light',
}: EventDetailFooterProps) {
  const isPaid = Boolean(event.isPaid && event.priceCents);
  const actionLabel = isPaid ? 'Continue Booking' : 'Book your Seat';
  const isLight = theme === 'light';

  return (
    <div className={`mt-5 pt-5 ${isLight ? 'border-t border-[#E5E5E5]' : 'border-t border-white/10'}`}>
      {isPaid ? (
        <>
          <p className={`text-3xl font-bold ${isLight ? 'text-ckc-black' : 'text-cloud'}`}>
            {formatPrice(event.priceCents!, event.currency)}
          </p>
          <p className={`mt-1 text-xs ${isLight ? 'text-ckc-muted' : 'text-cloud/40'}`}>per person</p>
        </>
      ) : (
        <p className={`text-base font-bold ${isLight ? 'text-ckc-black' : 'text-cloud uppercase tracking-[0.25em]'}`}>
          Free
        </p>
      )}

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={onAction}
          className="btn-life-primary flex-1 py-3.5 text-sm"
        >
          {actionLabel}
        </button>
        <button
          type="button"
          onClick={onSecondary}
          className="btn-life-secondary flex h-12 w-12 items-center justify-center"
          aria-label="Event options"
        >
          <Icon name="AdjustmentsHorizontalIcon" size={18} variant="outline" />
        </button>
        <button
          type="button"
          onClick={onShare}
          className="btn-life-secondary flex h-12 w-12 items-center justify-center"
          aria-label="Share event"
        >
          <Icon name="ShareIcon" size={18} variant="outline" />
        </button>
      </div>
    </div>
  );
}
