'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import {
  createAnnouncement,
  deleteAnnouncement,
  getAdminAnnouncements,
  updateAnnouncement,
} from '@/lib/announcements/service';
import { CAMPUSES, getCampusLabel, type CampusId } from '@/lib/church/constants';
import { EVENT_VISIBILITY_OPTIONS } from '@/lib/events/types';
import {
  ANNOUNCEMENT_CATEGORIES,
  REPEAT_OPTIONS,
  type Announcement,
  type AnnouncementInput,
  type AnnouncementStatus,
} from '@/lib/announcements/types';
import type { ContentVisibility } from '@/lib/sermons/types';
import { useBackend } from '@/lib/api/client';

const emptyForm: AnnouncementInput = {
  campus: 'midrand',
  visibility: 'campus_only',
  title: '',
  content: '',
  category: 'General',
  pinned: false,
  status: 'draft',
  publishAt: '',
  expiresAt: '',
  repeatInterval: 'none',
  repeatUntil: '',
};

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<AnnouncementInput>(emptyForm);
  const backend = useBackend();

  const load = async () => {
    setItems(await getAdminAnnouncements({ allCampuses: true }));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (status: AnnouncementStatus) => {
    if (!form.title.trim() || !form.content.trim()) return;
    await createAnnouncement({ ...form, status, publishAt: form.publishAt || undefined });
    setShowModal(false);
    setForm(emptyForm);
    load();
  };

  const handlePublish = async (id: string) => {
    await updateAnnouncement(id, { status: 'published' });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete announcement?')) return;
    await deleteAnnouncement(id);
    load();
  };

  return (
    <AppShell access="staff">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cloud">Announcements</h1>
          <p className="text-cloud/40 text-sm mt-0.5">Schedule, repeat weekly/monthly, campus or church-wide</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-ckc-gold text-ckc-black font-semibold text-sm px-4 py-2.5 rounded-lg"
        >
          <Icon name="PlusIcon" size={16} variant="outline" />
          New Announcement
        </button>
      </div>

      {!backend && <p className="text-ckc-gold text-sm mb-4">Connect Supabase to manage announcements.</p>}

      <div className="space-y-3">
        {items.map((a) => (
          <div key={a.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex justify-between gap-3">
              <div>
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] uppercase text-ckc-gold">{a.category}</span>
                  <span className="text-[10px] text-cloud/30">· {getCampusLabel(a.campus)}</span>
                  {a.visibility === 'church_wide' && <span className="text-[10px] text-ckc-gold">All campuses</span>}
                </div>
                <h3 className="font-bold text-cloud mt-1">{a.title}</h3>
                <p className="text-xs text-cloud/40 mt-1 line-clamp-2">{a.content}</p>
                <p className="text-[10px] text-cloud/30 mt-2">
                  {a.status} · {a.date}
                  {a.repeatInterval !== 'none' && ` · Repeats ${a.repeatInterval}`}
                </p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                {a.status !== 'published' && (
                  <button onClick={() => handlePublish(a.id)} className="text-xs text-ckc-gold">Publish</button>
                )}
                <button onClick={() => handleDelete(a.id)} className="text-xs text-rose-400">Delete</button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && backend && (
          <p className="text-center text-cloud/40 py-12">No announcements yet.</p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-ckc-card p-6">
            <h2 className="text-lg font-bold text-cloud mb-4">New Announcement</h2>
            <div className="space-y-3">
              <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud" />
              <textarea placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud" />
              <div className="grid grid-cols-2 gap-2">
                <select value={form.campus} onChange={(e) => setForm({ ...form, campus: e.target.value as CampusId })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud">
                  {CAMPUSES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
                <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value as ContentVisibility })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud">
                  {EVENT_VISIBILITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud">
                {ANNOUNCEMENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-cloud/40">Publish at (schedule)</label>
                  <input type="datetime-local" value={form.publishAt} onChange={(e) => setForm({ ...form, publishAt: e.target.value, status: 'scheduled' })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud" />
                </div>
                <div>
                  <label className="text-[10px] text-cloud/40">Expires</label>
                  <input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={form.repeatInterval} onChange={(e) => setForm({ ...form, repeatInterval: e.target.value as AnnouncementInput['repeatInterval'] })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud">
                  {REPEAT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {form.repeatInterval !== 'none' && (
                  <input type="date" value={form.repeatUntil?.slice(0, 10)} onChange={(e) => setForm({ ...form, repeatUntil: e.target.value })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud" placeholder="Repeat until" />
                )}
              </div>
              <label className="flex items-center gap-2 text-xs text-cloud/60">
                <input type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} className="accent-ckc-gold" />
                Pin to top
              </label>
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm text-cloud/60">Cancel</button>
              <button onClick={() => handleSave('draft')} className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm text-cloud/60">Save Draft</button>
              <button onClick={() => handleSave(form.publishAt ? 'scheduled' : 'published')} className="flex-1 rounded-lg bg-ckc-gold py-2.5 text-sm font-bold text-ckc-black">
                {form.publishAt ? 'Schedule' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
