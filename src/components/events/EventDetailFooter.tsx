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
    <div className={`mt-3 pt-3 ${isLight ? 'border-t border-[#E5E5E5]' : 'border-t border-white/10'}`}>
      {isPaid ? (
        <p className={`text-[19px] font-medium ${isLight ? 'text-ckc-black' : 'text-cloud'}`}>
          {formatPrice(event.priceCents!, event.currency)}
        </p>
      ) : (
        <p className={`text-base font-medium ${isLight ? 'text-ckc-black' : 'text-cloud uppercase tracking-[0.25em]'}`}>
          Free
        </p>
      )}

      <div className="mt-3 flex items-center gap-1.5">
        <button
          type="button"
          onClick={onAction}
          className="btn-life-primary flex-1 py-3.5"
        >
          {actionLabel}
        </button>
        <button
          type="button"
          onClick={onSecondary}
          className="btn-life-secondary flex h-[38px] w-[38px] items-center justify-center"
          aria-label="Event options"
        >
          <Icon name="AdjustmentsHorizontalIcon" size={15} variant="outline" />
        </button>
        <button
          type="button"
          onClick={onShare}
          className="btn-life-secondary flex h-[38px] w-[38px] items-center justify-center"
          aria-label="Share event"
        >
          <Icon name="ShareIcon" size={15} variant="outline" />
        </button>
      </div>
    </div>
  );
}
