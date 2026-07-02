'use client';

import React, { useRef, useState } from 'react';
import { CAMPUSES } from '@/lib/church/constants';
import { uploadEventImage } from '@/lib/events/service';
import { EVENT_CATEGORIES, EVENT_VISIBILITY_OPTIONS, type EventInput } from '@/lib/events/types';
import type { CampusId } from '@/lib/church/constants';
import type { ContentVisibility } from '@/lib/sermons/types';

interface EventFormFieldsProps {
  form: EventInput;
  onChange: (form: EventInput) => void;
  eventId?: string;
}

export default function EventFormFields({ form, onChange, eventId }: EventFormFieldsProps) {
  const set = (patch: Partial<EventInput>) => onChange({ ...form, ...patch });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadError('');
    setUploading(true);
    try {
      const { url } = await uploadEventImage(file, eventId);
      set({ imageUrl: url });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

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

        <div className="space-y-2">
          <p className="text-xs text-cloud/50">Event poster (16:9 recommended)</p>
          {form.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.imageUrl}
              alt="Event poster preview"
              className="h-32 w-full rounded-lg object-cover border border-white/10"
            />
          ) : null}
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImagePick}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border border-ckc-gold/30 bg-ckc-gold/10 px-3 py-2 text-xs font-semibold text-ckc-gold disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : form.imageUrl ? 'Replace image' : 'Upload image'}
            </button>
            {form.imageUrl ? (
              <button
                type="button"
                onClick={() => set({ imageUrl: '' })}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs text-cloud/50 hover:text-cloud"
              >
                Remove
              </button>
            ) : null}
          </div>
          {uploadError ? <p className="text-xs text-red-400">{uploadError}</p> : null}
          <input
            placeholder="Or paste image URL"
            value={form.imageUrl ?? ''}
            onChange={(e) => set({ imageUrl: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud"
          />
        </div>

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
