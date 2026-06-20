'use client';

import React, { useCallback, useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import { CAMPUSES, getCampusLabel, type CampusId } from '@/lib/church/constants';
import { fetchProfileForSession, getSession } from '@/lib/auth/session';
import { hasAllCampusAccess } from '@/lib/auth/church-wide-staff';
import {
  createMediaItem,
  deleteMediaItem,
  getAdminMediaItems,
} from '@/lib/sermons/service';
import {
  MEDIA_TYPES,
  SERMON_CATEGORIES,
  VISIBILITY_OPTIONS,
  type ContentVisibility,
  type MediaItem,
  type MediaType,
} from '@/lib/sermons/types';
import { getThumbnailUrl, getWatchUrl, visibilityLabel } from '@/lib/sermons/utils';

const typeColors: Record<string, string> = {
  Sermon: 'bg-sky/10 text-sky border-sky/20',
  Audio: 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20',
  Book: 'bg-amber-500/10 text-amber-400 border-amber-400/20',
  'Special Message': 'bg-purple-500/10 text-purple-400 border-purple-400/20',
};

interface SermonForm {
  campus: CampusId;
  visibility: ContentVisibility;
  title: string;
  preacher: string;
  date: string;
  type: MediaType;
  category: string;
  youtubeId: string;
  externalUrl: string;
  duration: string;
  series: string;
  description: string;
}

const emptyForm = (campus: CampusId = 'midrand'): SermonForm => ({
  campus,
  visibility: 'campus_only',
  title: '',
  preacher: '',
  date: '',
  type: 'Sermon',
  category: 'Sunday Service',
  youtubeId: '',
  externalUrl: '',
  duration: '',
  series: '',
  description: '',
});

export default function AdminSermonsPage() {
  const [sermons, setSermons] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminCampus, setAdminCampus] = useState<CampusId>('midrand');
  const [allCampusAccess, setAllCampusAccess] = useState(false);
  const [showAllCampuses, setShowAllCampuses] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState<SermonForm>(emptyForm());
  const [notification, setNotification] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const items = await getAdminMediaItems({
        campusId: showAllCampuses ? undefined : adminCampus,
        allCampuses: allCampusAccess && showAllCampuses,
      });
      setSermons(items);
    } finally {
      setLoading(false);
    }
  }, [adminCampus, allCampusAccess, showAllCampuses]);

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    fetchProfileForSession(session).then((profile) => {
      if (profile?.campusId) {
        setAdminCampus(profile.campusId as CampusId);
        setForm(emptyForm(profile.campusId as CampusId));
      }
      setAllCampusAccess(
        hasAllCampusAccess({
          isSuperAdmin: profile?.isSuperAdmin,
          role: profile?.role ?? session.role,
          dbRole: profile?.dbRole,
        }),
      );
      refresh();
    });
  }, [refresh]);

  const filtered = sermons.filter((s) => {
    const matchSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.preacher.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || s.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createMediaItem({
        campus: form.campus,
        visibility: form.visibility,
        type: form.type,
        title: form.title,
        preacher: form.preacher,
        date: form.date,
        category: form.category,
        series: form.series || undefined,
        description: form.description,
        duration: form.duration,
        youtubeId: form.youtubeId || undefined,
        externalUrl: form.externalUrl || undefined,
      });
      setForm(emptyForm(adminCampus));
      setShowAddModal(false);
      showNotif(`✓ "${form.title}" added`);
      refresh();
    } catch (err) {
      showNotif(err instanceof Error ? err.message : 'Could not add message');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    try {
      await deleteMediaItem(id);
      showNotif(`"${title}" removed`);
      refresh();
    } catch {
      showNotif('Could not delete');
    }
  };

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <AppShell access="staff">
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 text-sm px-4 py-3 rounded-xl shadow-xl backdrop-blur-sm max-w-sm">
          {notification}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cloud tracking-tight">Sermons & Messages</h1>
          <p className="text-cloud/40 text-sm mt-0.5">
            {loading ? 'Loading…' : `${sermons.length} messages`}
            {!showAllCampuses && ` · ${getCampusLabel(adminCampus)}`}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-sky text-slate-dark font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-sky/90 transition-colors"
        >
          <Icon name="PlusIcon" size={16} variant="outline" />
          Add Message
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Icon name="MagnifyingGlassIcon" size={16} variant="outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-cloud/30" />
          <input
            type="text"
            placeholder="Search sermons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-cloud placeholder-cloud/30 focus:outline-none focus:border-sky/50 transition-colors"
          />
        </div>
        {allCampusAccess && (
          <label className="flex items-center gap-2 text-xs text-cloud/50 px-3 py-2 rounded-lg border border-white/10">
            <input
              type="checkbox"
              checked={showAllCampuses}
              onChange={(e) => setShowAllCampuses(e.target.checked)}
              className="accent-sky"
            />
            All campuses
          </label>
        )}
        <div className="flex flex-wrap gap-2">
          {['All', ...MEDIA_TYPES].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                typeFilter === t
                  ? 'bg-sky/10 text-sky border-sky/30'
                  : 'bg-white/5 text-cloud/50 border-white/10 hover:text-cloud hover:border-white/20'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs font-semibold text-cloud/40 px-4 py-3">Title</th>
                <th className="text-left text-xs font-semibold text-cloud/40 px-4 py-3 hidden md:table-cell">Campus</th>
                <th className="text-left text-xs font-semibold text-cloud/40 px-4 py-3 hidden sm:table-cell">Type</th>
                <th className="text-left text-xs font-semibold text-cloud/40 px-4 py-3 hidden lg:table-cell">Visibility</th>
                <th className="text-left text-xs font-semibold text-cloud/40 px-4 py-3 hidden md:table-cell">Date</th>
                <th className="text-right text-xs font-semibold text-cloud/40 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sermon) => {
                const thumb = getThumbnailUrl(sermon);
                const watch = getWatchUrl(sermon);
                return (
                  <tr key={sermon.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {thumb && (
                          <div className="w-14 h-9 rounded-lg overflow-hidden bg-black/40 flex-shrink-0 hidden sm:block">
                            <img src={thumb} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-cloud text-sm font-medium truncate max-w-[180px]">{sermon.title}</p>
                          <p className="text-cloud/40 text-xs truncate">{sermon.preacher}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-cloud/50 text-xs">{getCampusLabel(sermon.campus)}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeColors[sermon.type]}`}>
                        {sermon.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-cloud/50 text-xs">{visibilityLabel(sermon.visibility)}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-cloud/50 text-xs">{sermon.date}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {watch && (
                          <a
                            href={watch}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-cloud/40 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                            aria-label="Open media link"
                          >
                            <Icon name="PlayCircleIcon" size={15} variant="outline" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(sermon.id, sermon.title)}
                          className="p-1.5 rounded-lg text-cloud/40 hover:text-rose-400 hover:bg-rose-500/5 transition-colors"
                          aria-label="Delete"
                        >
                          <Icon name="TrashIcon" size={15} variant="outline" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-cloud/30">
            <Icon name="PlayCircleIcon" size={32} variant="outline" className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No messages yet — add one or run the media_items migration in Supabase</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-cloud">Add Message</h2>
              <button onClick={() => setShowAddModal(false)} className="text-cloud/40 hover:text-cloud">
                <Icon name="XMarkIcon" size={20} variant="outline" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Campus *</label>
                  <select
                    value={form.campus}
                    onChange={(e) => setForm((f) => ({ ...f, campus: e.target.value as CampusId }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud"
                  >
                    {CAMPUSES.map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-800">{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Who can see it? *</label>
                  <select
                    value={form.visibility}
                    onChange={(e) => setForm((f) => ({ ...f, visibility: e.target.value as ContentVisibility }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud"
                  >
                    {VISIBILITY_OPTIONS.map((v) => (
                      <option key={v.value} value={v.value} className="bg-slate-800">{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-[10px] text-cloud/30 -mt-2">
                {VISIBILITY_OPTIONS.find((v) => v.value === form.visibility)?.hint}
              </p>

              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Preacher *</label>
                <input
                  required
                  value={form.preacher}
                  onChange={(e) => setForm((f) => ({ ...f, preacher: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as MediaType }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud"
                  >
                    {MEDIA_TYPES.map((t) => (
                      <option key={t} className="bg-slate-800">{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud"
                  >
                    {SERMON_CATEGORIES.map((c) => (
                      <option key={c} className="bg-slate-800">{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Date *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Duration</label>
                  <input
                    value={form.duration}
                    onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                    placeholder="45 min"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">YouTube link or video ID</label>
                <input
                  value={form.youtubeId}
                  onChange={(e) => setForm((f) => ({ ...f, youtubeId: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=… or dQw4w9WgXcQ"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">
                  Or external link <span className="font-normal text-cloud/30">(Spotify, Apple Podcasts, YouVersion)</span>
                </label>
                <input
                  value={form.externalUrl}
                  onChange={(e) => setForm((f) => ({ ...f, externalUrl: e.target.value }))}
                  placeholder="https://open.spotify.com/episode/…"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Series (optional)</label>
                <input
                  value={form.series}
                  onChange={(e) => setForm((f) => ({ ...f, series: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-white/5 border border-white/10 text-cloud/70 text-sm font-semibold py-2.5 rounded-lg">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 bg-sky text-slate-dark text-sm font-bold py-2.5 rounded-lg disabled:opacity-60">
                  {saving ? 'Saving…' : 'Add Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
