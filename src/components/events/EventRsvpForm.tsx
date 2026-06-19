'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { rsvpToEvent } from '@/lib/events/service';
import { formatPrice } from '@/lib/events/utils';
import type { ChurchEvent } from '@/lib/events/types';
import { formatPhoneDisplay } from '@/lib/auth/session';

interface EventRsvpFormProps {
  event: ChurchEvent;
  defaultName?: string;
  defaultPhone?: string;
  defaultEmail?: string;
  isVisitor?: boolean;
  onSuccess?: (ticketCode?: string, paymentUrl?: string) => void;
}

export default function EventRsvpForm({
  event,
  defaultName = '',
  defaultPhone = '',
  defaultEmail = '',
  isVisitor = false,
  onSuccess,
}: EventRsvpFormProps) {
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [email, setEmail] = useState(defaultEmail);
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ticketCode, setTicketCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!phone.trim() && !email.trim()) {
      setError('Phone or email is required');
      return;
    }

    setLoading(true);
    try {
      const result = await rsvpToEvent(event.id, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        isVisitor,
        guestsCount: guests,
      });

      if (result.paymentUrl) {
        window.open(result.paymentUrl, '_blank');
      }

      const code = result.ticketCode ?? result.rsvp.ticketCode;
      if (code) setTicketCode(code);
      onSuccess?.(code, result.paymentUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'RSVP failed');
    } finally {
      setLoading(false);
    }
  };

  if (ticketCode) {
    return (
      <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-6 text-center">
        <Icon name="CheckCircleIcon" size={40} variant="solid" className="mx-auto text-emerald-400 mb-3" />
        <h3 className="text-lg font-bold text-cloud">You&apos;re registered!</h3>
        <p className="text-sm text-cloud/60 mt-1">Show this ticket code at the event entrance:</p>
        <p className="mt-3 font-mono text-2xl font-bold tracking-widest text-ckc-gold">{ticketCode}</p>
        <p className="text-xs text-cloud/40 mt-3">A confirmation has been noted for {event.title}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {event.isPaid && event.priceCents && (
        <div className="rounded-lg border border-ckc-gold/30 bg-ckc-gold/10 px-4 py-3 text-sm text-ckc-gold">
          Paid event — {formatPrice(event.priceCents, event.currency)} per person (Yoco payment)
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-semibold text-cloud/50">Full name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-cloud"
          placeholder="Your name"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-cloud/50">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-cloud"
            placeholder="082 123 4567"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-cloud/50">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-cloud"
            placeholder="you@email.com"
          />
        </div>
      </div>
      <p className="text-[10px] text-cloud/30">Phone or email required — we&apos;ll send reminders before the event</p>

      <div>
        <label className="mb-1 block text-xs font-semibold text-cloud/50">Guests (including you)</label>
        <input
          type="number"
          min={1}
          max={10}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="w-24 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-cloud"
        />
      </div>

      {defaultPhone && (
        <p className="text-xs text-cloud/40">Registered as {formatPhoneDisplay(defaultPhone)}</p>
      )}

      {error && <p className="text-sm text-rose-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-ckc-gold py-3 text-sm font-bold text-ckc-black hover:bg-ckc-gold-light disabled:opacity-50"
      >
        {loading ? 'Submitting…' : event.isPaid ? 'RSVP & Pay with Yoco' : 'Confirm RSVP'}
      </button>
    </form>
  );
}
