'use client';

import React from 'react';
import { CAMPUSES } from '@/lib/church/constants';
import { EVENT_CATEGORIES, EVENT_VISIBILITY_OPTIONS, type EventInput } from '@/lib/events/types';
import type { CampusId } from '@/lib/church/constants';
import type { ContentVisibility } from '@/lib/sermons/types';

interface EventFormFieldsProps {
  form: EventInput;
  onChange: (form: EventInput) => void;
}

export default function EventFormFields({ form, onChange }: EventFormFieldsProps) {
  const set = (patch: Partial<EventInput>) => onChange({ ...form, ...patch });

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-ckc-gold">Basics</h3>
        <input
          placeholder="Event title *"
          value={form.title}
          onChange={(e) => set({ title: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud"
        />
        <input
          placeholder="Image URL (16:9 recommended)"
          value={form.imageUrl ?? ''}
          onChange={(e) => set({ imageUrl: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud"
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={form.campus}
            onChange={(e) => set({ campus: e.target.value as CampusId })}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud"
          >
            {CAMPUSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            value={form.visibility}
            onChange={(e) => set({ visibility: e.target.value as ContentVisibility })}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud"
          >
            {EVENT_VISIBILITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <select
          value={form.category}
          onChange={(e) => set({ category: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud"
        >
          {EVENT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="datetime-local"
            value={form.startsAt}
            onChange={(e) => set({ startsAt: e.target.value })}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud"
          />
          <input
            type="datetime-local"
            value={form.endsAt ?? ''}
            onChange={(e) => set({ endsAt: e.target.value })}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud"
          />
        </div>
        <input
          type="number"
          placeholder="Capacity (optional)"
          value={form.capacity ?? ''}
          onChange={(e) => set({ capacity: e.target.value ? Number(e.target.value) : undefined })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud"
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-ckc-gold">Event Info</h3>
        <textarea
          placeholder="Full event description"
          value={form.eventInfo ?? ''}
          onChange={(e) => set({ eventInfo: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud"
          rows={4}
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-ckc-gold">Venue &amp; Location</h3>
        <input
          placeholder="Venue name"
          value={form.venueName ?? ''}
          onChange={(e) => set({ venueName: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud"
        />
        <input
          placeholder="Street address"
          value={form.venueAddress ?? ''}
          onChange={(e) => set({ venueAddress: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud"
        />
        <input
          placeholder="City / province"
          value={form.venueCity ?? ''}
          onChange={(e) => set({ venueCity: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud"
        />
        <input
          placeholder="Short location label (fallback)"
          value={form.location}
          onChange={(e) => set({ location: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud"
        />
        <input
          placeholder="Google Maps / directions link"
          value={form.venueDirectionsUrl ?? ''}
          onChange={(e) => set({ venueDirectionsUrl: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud"
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-ckc-gold">Important Info</h3>
        <textarea
          placeholder="Important information for attendees"
          value={form.importantInfo ?? ''}
          onChange={(e) => set({ importantInfo: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud"
          rows={4}
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-ckc-gold">Ticketing</h3>
        <label className="flex items-center gap-2 text-xs text-cloud/60">
          <input
            type="checkbox"
            checked={form.isPaid}
            onChange={(e) => set({ isPaid: e.target.checked })}
            className="accent-ckc-gold"
          />
          Paid event (Yoco)
        </label>
        {form.isPaid && (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Price (cents)"
              value={form.priceCents ?? ''}
              onChange={(e) => set({ priceCents: Number(e.target.value) })}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud"
            />
            <input
              placeholder="Yoco payment page link"
              value={form.yocoPaymentLink}
              onChange={(e) => set({ yocoPaymentLink: e.target.value })}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud"
            />
          </div>
        )}
        <input
          type="number"
          placeholder="Reminder hours before event"
          value={form.reminderHoursBefore}
          onChange={(e) => set({ reminderHoursBefore: Number(e.target.value) })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud"
        />
      </section>
    </div>
  );
}
