'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';

interface Sermon {
  id: number;
  title: string;
  preacher: string;
  date: string;
  type: 'Sermon' | 'Audio' | 'Book' | 'Special Message';
  category: string;
  youtubeId: string;
  duration: string;
  description: string;
  series?: string;
}

const initialSermons: Sermon[] = [
  { id: 1, title: 'Walking in Purpose', preacher: 'Pastor James Mokoena', date: '15 Jun 2025', type: 'Sermon', category: 'Sunday Service', youtubeId: 'dQw4w9WgXcQ', duration: '52 min', description: "Discovering God's purpose for your life and walking boldly in it.", series: 'Purpose Series' },
  { id: 2, title: 'Faith Over Fear', preacher: 'Pastor James Mokoena', date: '8 Jun 2025', type: 'Sermon', category: 'Sunday Service', youtubeId: 'L_jWHffIx5E', duration: '48 min', description: 'How to overcome fear through unwavering faith in God.', series: 'Purpose Series' },
  { id: 3, title: "Women of Strength — Women's Day 2025", preacher: 'Pastor Sarah Dlamini', date: '9 Aug 2025', type: 'Special Message', category: "Women's Day", youtubeId: 'kJQP7kiw5Fk', duration: '61 min', description: 'A powerful message celebrating the strength and grace of women in the church.' },
  { id: 4, title: 'Rise Up — Youth Conference 2025', preacher: 'Evangelist Thabo Sithole', date: '5 Apr 2025', type: 'Special Message', category: 'Youth Conference', youtubeId: 'fJ9rUzIMcZQ', duration: '55 min', description: 'A fire-filled message for the next generation to rise and take their place.' },
  { id: 5, title: 'The Power of Prayer', preacher: 'Pastor James Mokoena', date: '1 Jun 2025', type: 'Audio', category: 'Prayer Meeting', youtubeId: 'OPf0YbXqDm0', duration: '38 min', description: 'Understanding the transformative power of a consistent prayer life.' },
  { id: 6, title: 'Knowing God Deeply', preacher: 'Elder Ruth Khumalo', date: '25 May 2025', type: 'Sermon', category: 'Sunday Service', youtubeId: 'hT_nvWreIhg', duration: '44 min', description: 'A deep dive into intimacy with God through His Word and Spirit.' },
];

const typeColors: Record<string, string> = {
  'Sermon': 'bg-sky/10 text-sky border-sky/20',
  'Audio': 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20',
  'Book': 'bg-amber-500/10 text-amber-400 border-amber-400/20',
  'Special Message': 'bg-purple-500/10 text-purple-400 border-purple-400/20',
};

interface SermonForm {
  title: string;
  preacher: string;
  date: string;
  type: string;
  category: string;
  youtubeId: string;
  duration: string;
  series: string;
  description: string;
}

const emptyForm: SermonForm = {
  title: '',
  preacher: '',
  date: '',
  type: 'Sermon',
  category: 'Sunday Service',
  youtubeId: '',
  duration: '',
  series: '',
  description: '',
};

export default function AdminSermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>(initialSermons);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState<SermonForm>(emptyForm);
  const [notification, setNotification] = useState<string | null>(null);

  const filtered = sermons.filter((s) => {
    const matchSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.preacher.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || s.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newSermon: Sermon = {
      id: Date.now(),
      title: form.title,
      preacher: form.preacher,
      date: form.date,
      type: form.type as Sermon['type'],
      category: form.category,
      youtubeId: form.youtubeId,
      duration: form.duration,
      series: form.series || undefined,
      description: form.description,
    };
    setSermons((prev) => [newSermon, ...prev]);
    setForm(emptyForm);
    setShowAddModal(false);
    showNotif(`✓ "${newSermon.title}" added successfully`);
  };

  const handleDelete = (id: number, title: string) => {
    setSermons((prev) => prev.filter((s) => s.id !== id));
    showNotif(`Sermon "${title}" removed`);
  };

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <AppShell access="staff">
      {/* Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 text-sm px-4 py-3 rounded-xl shadow-xl backdrop-blur-sm max-w-sm">
          {notification}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cloud tracking-tight">Sermons & Messages</h1>
          <p className="text-cloud/40 text-sm mt-0.5">{sermons.length} total messages</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-sky text-slate-dark font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-sky/90 transition-colors"
        >
          <Icon name="PlusIcon" size={16} variant="outline" />
          Add Sermon
        </button>
      </div>

      {/* Filters */}
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
        <div className="flex flex-wrap gap-2">
          {['All', 'Sermon', 'Audio', 'Book', 'Special Message'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                typeFilter === t
                  ? 'bg-sky/10 text-sky border-sky/30' :'bg-white/5 text-cloud/50 border-white/10 hover:text-cloud hover:border-white/20'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Sermons Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs font-semibold text-cloud/40 px-4 py-3">Title</th>
                <th className="text-left text-xs font-semibold text-cloud/40 px-4 py-3 hidden md:table-cell">Preacher</th>
                <th className="text-left text-xs font-semibold text-cloud/40 px-4 py-3 hidden sm:table-cell">Type</th>
                <th className="text-left text-xs font-semibold text-cloud/40 px-4 py-3 hidden lg:table-cell">Category</th>
                <th className="text-left text-xs font-semibold text-cloud/40 px-4 py-3 hidden md:table-cell">Date</th>
                <th className="text-left text-xs font-semibold text-cloud/40 px-4 py-3 hidden lg:table-cell">Duration</th>
                <th className="text-right text-xs font-semibold text-cloud/40 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sermon) => (
                <tr key={sermon.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-9 rounded-lg overflow-hidden bg-black/40 flex-shrink-0 hidden sm:block">
                        <img
                          src={`https://img.youtube.com/vi/${sermon.youtubeId}/mqdefault.jpg`}
                          alt={`Thumbnail for ${sermon.title}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-cloud text-sm font-medium truncate max-w-[180px]">{sermon.title}</p>
                        {sermon.series && <p className="text-sky text-xs truncate">{sermon.series}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-cloud/70 text-sm">{sermon.preacher}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeColors[sermon.type] || 'bg-white/5 text-cloud/40 border-white/10'}`}>
                      {sermon.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-cloud/50 text-xs">{sermon.category}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-cloud/50 text-xs">{sermon.date}</p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-cloud/40 text-xs font-mono">{sermon.duration}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`https://www.youtube.com/watch?v=${sermon.youtubeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-cloud/40 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                        aria-label="Watch on YouTube"
                      >
                        <Icon name="PlayCircleIcon" size={15} variant="outline" />
                      </a>
                      <button
                        onClick={() => handleDelete(sermon.id, sermon.title)}
                        className="p-1.5 rounded-lg text-cloud/40 hover:text-rose-400 hover:bg-rose-500/5 transition-colors"
                        aria-label="Delete sermon"
                      >
                        <Icon name="TrashIcon" size={15} variant="outline" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-cloud/30">
            <Icon name="PlayCircleIcon" size={32} variant="outline" className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No sermons found</p>
          </div>
        )}
      </div>

      {/* Add Sermon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-cloud">Add Sermon / Message</h2>
              <button onClick={() => setShowAddModal(false)} className="text-cloud/40 hover:text-cloud">
                <Icon name="XMarkIcon" size={20} variant="outline" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Walking in Purpose"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors"
                />
              </div>

              {/* Preacher */}
              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Preacher *</label>
                <input
                  type="text"
                  required
                  value={form.preacher}
                  onChange={(e) => setForm((f) => ({ ...f, preacher: e.target.value }))}
                  placeholder="e.g. Pastor James Mokoena"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors"
                />
              </div>

              {/* Type + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud focus:outline-none focus:border-sky/50 transition-colors"
                  >
                    <option className="bg-slate-800">Sermon</option>
                    <option className="bg-slate-800">Audio</option>
                    <option className="bg-slate-800">Book</option>
                    <option className="bg-slate-800">Special Message</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud focus:outline-none focus:border-sky/50 transition-colors"
                  >
                    <option className="bg-slate-800">Sunday Service</option>
                    <option className="bg-slate-800">Midweek Service</option>
                    <option className="bg-slate-800">Prayer Meeting</option>
                    <option className="bg-slate-800">Bible Study</option>
                    <option className="bg-slate-800">Youth Conference</option>
                    <option className="bg-slate-800">Women&apos;s Day</option>
                    <option className="bg-slate-800">Easter</option>
                    <option className="bg-slate-800">Special Event</option>
                  </select>
                </div>
              </div>

              {/* Date + Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Date *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud focus:outline-none focus:border-sky/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Duration</label>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                    placeholder="e.g. 45 min"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors"
                  />
                </div>
              </div>

              {/* YouTube ID */}
              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">YouTube Video ID *</label>
                <input
                  type="text"
                  required
                  value={form.youtubeId}
                  onChange={(e) => setForm((f) => ({ ...f, youtubeId: e.target.value }))}
                  placeholder="e.g. dQw4w9WgXcQ (from YouTube URL)"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors"
                />
                <p className="text-cloud/30 text-xs mt-1">The ID after ?v= in the YouTube URL</p>
              </div>

              {/* Series (optional) */}
              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Series (optional)</label>
                <input
                  type="text"
                  value={form.series}
                  onChange={(e) => setForm((f) => ({ ...f, series: e.target.value }))}
                  placeholder="e.g. Purpose Series"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of the message..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setForm(emptyForm); }}
                  className="flex-1 bg-white/5 border border-white/10 text-cloud/70 text-sm font-semibold py-2.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-sky text-slate-dark text-sm font-bold py-2.5 rounded-lg hover:bg-sky/90 transition-colors"
                >
                  Add Sermon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
