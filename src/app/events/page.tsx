'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import PageHeader from '@/components/portal/PageHeader';
import EventFormFields from '@/components/events/EventFormFields';
import EventListRow from '@/components/events/EventListRow';
import {
  createEvent,
  deleteEvent,
  getAdminEvents,
  getEventRsvps,
  updateEvent,
} from '@/lib/events/service';
import { churchEventToInput } from '@/lib/events/form';
import { CAMPUSES, getCampusLabel, type CampusId } from '@/lib/church/constants';
import { groupEventsByMonth } from '@/lib/events/utils';
import type { ChurchEvent, EventInput, EventRsvp } from '@/lib/events/types';
import { getSession } from '@/lib/auth/session';
import { hasAllCampusAccess } from '@/lib/auth/church-wide-staff';
import { useBackend } from '@/lib/api/client';

const emptyForm: EventInput = {
  title: '',
  description: '',
  eventInfo: '',
  campus: 'midrand',
  visibility: 'campus_only',
  category: 'General',
  location: '',
  venueName: '',
  venueAddress: '',
  venueCity: '',
  venueDirectionsUrl: '',
  importantInfo: '',
  startsAt: '',
  endsAt: '',
  imageUrl: '',
  capacity: undefined,
  isPaid: false,
  priceCents: undefined,
  yocoPaymentLink: '',
  reminderHoursBefore: 24,
};

export default function EventsPage() {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventInput>(emptyForm);
  const [selected, setSelected] = useState<ChurchEvent | null>(null);
  const [rsvps, setRsvps] = useState<EventRsvp[]>([]);
  const [campusFilter, setCampusFilter] = useState<CampusId | 'all'>('all');
  const [saving, setSaving] = useState(false);
  const backend = useBackend();

  const session = getSession();
  const allCampusAccess = hasAllCampusAccess({
    isSuperAdmin: session?.isSuperAdmin,
    role: session?.role,
  });

  const load = async () => {
    const list = await getAdminEvents({
      allCampuses: campusFilter === 'all' && allCampusAccess,
      campusId: campusFilter !== 'all' ? campusFilter : allCampusAccess ? undefined : 'midrand',
    });
    setEvents(list);
  };

  useEffect(() => {
    load();
  }, [campusFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowFormModal(true);
  };

  const openEdit = (event: ChurchEvent) => {
    setEditingId(event.id);
    setForm(churchEventToInput(event));
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.startsAt) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateEvent(editingId, form);
      } else {
        await createEvent(form);
      }
      closeFormModal();
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await deleteEvent(id);
    if (selected?.id === id) setSelected(null);
    if (editingId === id) closeFormModal();
    load();
  };

  const openRsvps = async (event: ChurchEvent) => {
    setSelected(event);
    if (backend) setRsvps(await getEventRsvps(event.id));
  };

  const visitorRsvps = rsvps.filter((r) => r.isVisitor);
  const memberRsvps = rsvps.filter((r) => !r.isVisitor);
  const monthGroups = groupEventsByMonth(events);

  return (
    <AppShell access="staff">
      <PageHeader
        title="Events"
        subtitle="Create, edit, and manage campus events"
        actions={
          <div className="flex gap-2">
            <Link
              href="/events/scan"
              className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-cloud/70 hover:border-ckc-gold/30"
            >
              <Icon name="QrCodeIcon" size={16} variant="outline" />
              Scan tickets
            </Link>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-xl bg-ckc-gold px-4 py-2.5 text-sm font-bold text-ckc-black"
            >
              <Icon name="PlusIcon" size={16} variant="outline" />
              Create Event
            </button>
          </div>
        }
      />

      {allCampusAccess && (
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
        <p className="mb-4 text-sm text-ckc-gold">Connect Supabase to manage events. No dummy data shown.</p>
      )}

      {monthGroups.length > 0 ? (
        <div className="space-y-8">
          {monthGroups.map((group) => (
            <section key={group.monthKey}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ckc-gold">
                {group.monthLabel}
              </h2>
              <div className="space-y-3">
                {group.events.map((event) => (
                  <EventListRow
                    key={event.id}
                    event={event}
                    variant="admin"
                    theme="dark"
                    onEdit={openEdit}
                    onDelete={(e) => handleDelete(e.id, e.title)}
                    onRsvps={openRsvps}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        backend && (
          <p className="py-12 text-center text-cloud/40">No events yet — create your first event above.</p>
        )
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-ckc-card p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-cloud">{selected.title}</h2>
                <p className="text-xs text-cloud/40">
                  {selected.date} · {selected.rsvpCount} total RSVPs
                </p>
                <Link href={`/rsvp/${selected.id}`} className="mt-1 inline-block text-xs text-ckc-gold">
                  Share RSVP link
                </Link>
              </div>
              <button onClick={() => setSelected(null)} className="text-cloud/40 hover:text-cloud">
                ✕
              </button>
            </div>

            {visitorRsvps.length > 0 && (
              <div className="mb-4">
                <h3 className="mb-2 text-xs font-semibold uppercase text-ckc-gold">
                  Visitor RSVPs ({visitorRsvps.length})
                </h3>
                <div className="space-y-2">
                  {visitorRsvps.map((r) => (
                    <div key={r.id} className="rounded-lg border border-ckc-gold/20 bg-ckc-gold/5 p-3 text-xs">
                      <p className="font-semibold text-cloud">{r.name}</p>
                      <p className="text-cloud/40">
                        {r.phone || r.email} · {r.guestsCount} guest(s)
                      </p>
                      {r.ticketCode && <p className="mt-1 font-mono text-ckc-gold">{r.ticketCode}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h3 className="mb-2 text-xs font-semibold uppercase text-cloud/50">
              Member RSVPs ({memberRsvps.length})
            </h3>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {memberRsvps.map((r) => (
                <div key={r.id} className="rounded-lg border border-white/10 p-3 text-xs">
                  <p className="font-semibold text-cloud">{r.name}</p>
                  <p className="text-cloud/40">
                    {r.phone} · {r.ticketCode || 'No ticket'}
                  </p>
                </div>
              ))}
              {memberRsvps.length === 0 && <p className="text-xs text-cloud/30">No member RSVPs yet</p>}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  openEdit(selected);
                  setSelected(null);
                }}
                className="rounded-lg border border-ckc-gold/30 px-4 py-2 text-xs text-ckc-gold"
              >
                Edit event
              </button>
              <Link
                href={`/events/${selected.id}`}
                className="rounded-lg border border-white/10 px-4 py-2 text-xs text-cloud/70 hover:border-ckc-gold/30"
              >
                View details
              </Link>
            </div>
          </div>
        </div>
      )}

      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-ckc-card p-6">
            <h2 className="mb-4 text-lg font-bold text-cloud">
              {editingId ? 'Edit Event' : 'Create Event'}
            </h2>
            <EventFormFields form={form} onChange={setForm} eventId={editingId ?? undefined} />
            <div className="mt-6 flex gap-3">
              <button
                onClick={closeFormModal}
                className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm text-cloud/60"
              >
                Cancel
              </button>
              {editingId && (
                <button
                  onClick={() => handleDelete(editingId, form.title || 'this event')}
                  className="rounded-lg border border-rose-400/30 px-4 py-2.5 text-sm text-rose-400"
                >
                  Delete
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-lg bg-ckc-gold py-2.5 text-sm font-bold text-ckc-black disabled:opacity-50"
              >
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
