'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { rsvpToEvent } from '@/lib/events/service';
import { formatEventSummary, formatPrice } from '@/lib/events/utils';
import { getCampusLabel } from '@/lib/church/constants';
import type { ChurchEvent } from '@/lib/events/types';
import type { VisitorEventProfile } from '@/lib/events/visitor-profile';
import { visitorDisplayName } from '@/lib/events/visitor-profile';

interface EventRegisterPanelProps {
  event: ChurchEvent;
  isVisitor: boolean;
  memberName?: string;
  memberPhone?: string;
  memberEmail?: string;
  visitorProfile?: VisitorEventProfile | null;
  embedded?: boolean;
}

export default function EventRegisterPanel({
  event,
  isVisitor,
  memberName = '',
  memberPhone = '',
  memberEmail = '',
  visitorProfile = null,
  embedded = false,
}: EventRegisterPanelProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const [ticketCode, setTicketCode] = useState<string | null>(null);

  const displayName = isVisitor && visitorProfile ? visitorDisplayName(visitorProfile) : memberName;
  const phone = isVisitor && visitorProfile ? visitorProfile.phone : memberPhone;
  const email = isVisitor && visitorProfile ? visitorProfile.email : memberEmail;

  const handleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await rsvpToEvent(event.id, {
        name: displayName.trim(),
        phone: phone?.trim() || undefined,
        email: email?.trim() || undefined,
        isVisitor,
        visitorId: visitorProfile?.visitorId,
        guestsCount: 1,
      });

      if (result.paymentUrl) {
        window.open(result.paymentUrl, '_blank');
      }

      setTicketCode(result.ticketCode ?? result.rsvp.ticketCode ?? null);
      setRegistered(true);
      setShowConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const panelClass = embedded ? 'space-y-4' : 'rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4';

  if (registered) {
    return (
      <div className={embedded ? 'space-y-4' : 'rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6'}>
        <div className="text-center">
          <Icon name="CheckCircleIcon" size={44} variant="solid" className="mx-auto text-emerald-400 mb-3" />
          <h3 className="text-lg font-bold text-cloud">You&apos;re registered!</h3>
          <p className="text-sm text-cloud/60 mt-2">
            You have just registered for <strong className="text-cloud">{event.title}</strong>.
          </p>
        </div>

        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 text-sm text-cloud/70">
          <p>
            <span className="text-cloud/40">Date:</span> {event.date} · {event.time}
          </p>
          <p>
            <span className="text-cloud/40">Location:</span> {event.location || getCampusLabel(event.campus)}
          </p>
          {event.description && (
            <p>
              <span className="text-cloud/40">About:</span> {event.description}
            </p>
          )}
          {ticketCode && (
            <p className="pt-2 font-mono text-lg font-bold tracking-widest text-ckc-gold">{ticketCode}</p>
          )}
        </div>

        <p className="text-xs text-cloud/40 text-center mt-4">We look forward to seeing you there.</p>
      </div>
    );
  }

  if (showConfirm) {
    return (
      <div className={panelClass}>
        <h3 className="text-lg font-bold text-cloud">Confirm registration</h3>
        <p className="text-sm text-cloud/60">
          Are you sure you want to attend <strong className="text-cloud">{event.title}</strong>?
        </p>
        <p className="text-xs text-cloud/40">{formatEventSummary(event)}</p>
        {event.isPaid && event.priceCents && (
          <p className="text-sm text-ckc-gold">This is a paid event — {formatPrice(event.priceCents, event.currency)}</p>
        )}

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowConfirm(false)}
            disabled={loading}
            className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-semibold text-cloud/70 hover:border-white/20"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
            className="flex-1 rounded-xl bg-ckc-gold py-3 text-sm font-bold text-ckc-black hover:bg-ckc-gold-light disabled:opacity-50"
          >
            {loading ? 'Registering…' : 'Yes, register me'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={panelClass}>
      {!embedded && (
        <h2 className="text-lg font-bold text-cloud">
          {isVisitor ? 'Register for this event' : 'Your registration'}
        </h2>
      )}

      {!isVisitor && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-cloud/70 space-y-1">
          <p>
            <span className="text-cloud/40">Name:</span> {displayName || '—'}
          </p>
          {phone && (
            <p>
              <span className="text-cloud/40">Phone:</span> {phone}
            </p>
          )}
          {email && (
            <p>
              <span className="text-cloud/40">Email:</span> {email}
            </p>
          )}
        </div>
      )}

      {isVisitor && visitorProfile && (
        <p className="text-sm text-cloud/60">
          Registering as <strong className="text-cloud">{displayName}</strong>
        </p>
      )}

      {event.isPaid && event.priceCents ? (
        <p className="text-sm text-ckc-gold">Paid event — {formatPrice(event.priceCents, event.currency)} via Yoco</p>
      ) : (
        <p className="text-sm text-cloud/50">This event is free. Tap below to reserve your place.</p>
      )}

      {error && <p className="text-sm text-rose-400">{error}</p>}

      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="w-full rounded-xl bg-ckc-gold py-3 text-sm font-bold text-ckc-black hover:bg-ckc-gold-light"
      >
        {event.isPaid ? 'Register & pay' : 'RSVP'}
      </button>
    </div>
  );
}
