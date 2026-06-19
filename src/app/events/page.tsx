'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import PageHeader, { ContentCard } from '@/components/portal/PageHeader';
import {
  createEvent,
  deleteEvent,
  getAdminEvents,
  getEventRsvps,
} from '@/lib/events/service';
import { CAMPUSES, getCampusLabel, type CampusId } from '@/lib/church/constants';
import { EVENT_CATEGORIES, EVENT_VISIBILITY_OPTIONS, type ChurchEvent, type EventInput } from '@/lib/events/types';
import { formatPrice } from '@/lib/events/utils';
import { getSession } from '@/lib/auth/session';
import { useBackend } from '@/lib/api/client';
import type { EventRsvp } from '@/lib/events/types';
import type { ContentVisibility } from '@/lib/sermons/types';

const emptyForm: EventInput = {
  title: '',
  description: '',
  campus: 'midrand',
  visibility: 'campus_only',
  category: 'General',
  location: '',
  startsAt: '',
  endsAt: '',
  capacity: undefined,
  isPaid: false,
  priceCents: undefined,
  yocoPaymentLink: '',
  reminderHoursBefore: 24,
};

export default function EventsPage() {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<EventInput>(emptyForm);
  const [selected, setSelected] = useState<ChurchEvent | null>(null);
  const [rsvps, setRsvps] = useState<EventRsvp[]>([]);
  const [campusFilter, setCampusFilter] = useState<CampusId | 'all'>('all');
  const backend = useBackend();

  const session = getSession();
  const isSuperAdmin = session?.isSuperAdmin === true;

  const load = async () => {
    const list = await getAdminEvents({
      allCampuses: campusFilter === 'all' && isSuperAdmin,
      campusId: campusFilter !== 'all' ? campusFilter : isSuperAdmin ? undefined : 'midrand',
    });
    setEvents(list);
  };

  useEffect(() => {
    load();
  }, [campusFilter]);

  const openDetail = async (event: ChurchEvent) => {
    setSelected(event);
    if (backend) setRsvps(await getEventRsvps(event.id));
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.startsAt) return;
    await createEvent(form);
    setShowModal(false);
    setForm(emptyForm);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    await deleteEvent(id);
    setSelected(null);
    load();
  };

  const visitorRsvps = rsvps.filter((r) => r.isVisitor);
  const memberRsvps = rsvps.filter((r) => !r.isVisitor);

  return (
    <AppShell access="staff">
      <PageHeader
        title="Events"
        subtitle="Campus & collective events — visitor RSVPs appear below"
        actions={
          <div className="flex gap-2">
            <Link href="/events/scan" className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-cloud/70 hover:border-ckc-gold/30">
              <Icon name="QrCodeIcon" size={16} variant="outline" />
              Scan tickets
            </Link>
            <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-ckc-gold px-4 py-2.5 text-sm font-bold text-ckc-black"
          >
            <Icon name="PlusIcon" size={16} variant="outline" />
            Create Event
          </button>
          </div>
        }
      />

      {isSuperAdmin && (
        <div className="mb-4 flex gap-2">
          {(['all', ...CAMPUSES.map((c) => c.id)] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCampusFilter(c)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                campusFilter === c ? 'border-ckc-gold/30 bg-ckc-gold/10 text-ckc-gold' : 'border-white/10 text-cloud/50'
              }`}
            >
              {c === 'all' ? 'All campuses' : getCampusLabel(c)}
            </button>
          ))}
        </div>
      )}

      {!backend && (
        <p className="mb-4 text-sm text-amber-400">Connect Supabase to manage events. No dummy data shown.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => (
          <ContentCard key={e.id}>
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className="text-[10px] font-semibold uppercase text-ckc-gold">{e.category}</span>
              {e.visibility === 'church_wide' && (
                <span className="text-[10px] text-sky">· All campuses</span>
              )}
            </div>
            <h3 className="font-bold text-cloud">{e.title}</h3>
            <p className="text-xs text-cloud/40 mt-1">{e.date} · {e.time}</p>
            <p className="text-xs text-cloud/40">{e.location || getCampusLabel(e.campus)}</p>
            <p className="text-xs text-cloud/30 mt-2">{e.rsvpCount} RSVPs{e.isPaid && e.priceCents ? ` · ${formatPrice(e.priceCents)}` : ''}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => openDetail(e)} className="flex-1 rounded-lg border border-white/10 py-2 text-xs text-cloud/60 hover:border-ckc-gold/30">
                View RSVPs
              </button>
              <Link href={`/member/events/${e.id}`} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-cloud/60 hover:border-ckc-gold/30">
                Open
              </Link>
            </div>
          </ContentCard>
        ))}
      </div>

      {events.length === 0 && backend && (
        <p className="text-center text-cloud/40 py-12">No events yet — create your first event above.</p>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#1E293B] p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-cloud">{selected.title}</h2>
                <p className="text-xs text-cloud/40">{selected.date} · {selected.rsvpCount} total RSVPs</p>
                <Link href={`/rsvp/${selected.id}`} className="text-xs text-ckc-gold mt-1 inline-block">
                  Share RSVP link: /rsvp/{selected.id.slice(0, 8)}…
                </Link>
              </div>
              <button onClick={() => setSelected(null)} className="text-cloud/40 hover:text-cloud">✕</button>
            </div>

            {visitorRsvps.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-amber-400 uppercase mb-2">Visitor RSVPs ({visitorRsvps.length})</h3>
                <div className="space-y-2">
                  {visitorRsvps.map((r) => (
                    <div key={r.id} className="rounded-lg border border-amber-400/20 bg-amber-500/5 p-3 text-xs">
                      <p className="font-semibold text-cloud">{r.name}</p>
                      <p className="text-cloud/40">{r.phone || r.email} · {r.guestsCount} guest(s)</p>
                      {r.ticketCode && <p className="font-mono text-ckc-gold mt-1">{r.ticketCode}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h3 className="text-xs font-semibold text-cloud/50 uppercase mb-2">Member RSVPs ({memberRsvps.length})</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {memberRsvps.map((r) => (
                <div key={r.id} className="rounded-lg border border-white/10 p-3 text-xs">
                  <p className="font-semibold text-cloud">{r.name}</p>
                  <p className="text-cloud/40">{r.phone} · {r.ticketCode || 'No ticket'}</p>
                </div>
              ))}
              {memberRsvps.length === 0 && <p className="text-cloud/30 text-xs">No member RSVPs yet</p>}
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={() => handleDelete(selected.id)} className="rounded-lg border border-rose-400/30 px-4 py-2 text-xs text-rose-400">
                Delete event
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#1E293B] p-6">
            <h2 className="text-lg font-bold text-cloud mb-4">Create Event</h2>
            <div className="space-y-3">
              <input placeholder="Event title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud" rows={3} />
              <div className="grid grid-cols-2 gap-2">
                <select value={form.campus} onChange={(e) => setForm({ ...form, campus: e.target.value as CampusId })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud">
                  {CAMPUSES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
                <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value as ContentVisibility })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud">
                  {EVENT_VISIBILITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud">
                {EVENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud" />
              <div className="grid grid-cols-2 gap-2">
                <input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud" />
                <input type="number" placeholder="Capacity" value={form.capacity ?? ''} onChange={(e) => setForm({ ...form, capacity: e.target.value ? Number(e.target.value) : undefined })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud" />
              </div>
              <label className="flex items-center gap-2 text-xs text-cloud/60">
                <input type="checkbox" checked={form.isPaid} onChange={(e) => setForm({ ...form, isPaid: e.target.checked })} className="accent-ckc-gold" />
                Paid event (Yoco)
              </label>
              {form.isPaid && (
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Price (cents)" value={form.priceCents ?? ''} onChange={(e) => setForm({ ...form, priceCents: Number(e.target.value) })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud" />
                  <input placeholder="Yoco payment page link" value={form.yocoPaymentLink} onChange={(e) => setForm({ ...form, yocoPaymentLink: e.target.value })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud" />
                </div>
              )}
              <input type="number" placeholder="Reminder hours before" value={form.reminderHoursBefore} onChange={(e) => setForm({ ...form, reminderHoursBefore: Number(e.target.value) })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud" />
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm text-cloud/60">Cancel</button>
              <button onClick={handleCreate} className="flex-1 rounded-lg bg-ckc-gold py-2.5 text-sm font-bold text-ckc-black">Create</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
