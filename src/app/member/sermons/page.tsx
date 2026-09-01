'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import { getCampusLabel, type CampusId } from '@/lib/church/constants';
import { fetchProfileByPhone, getSession } from '@/lib/auth/session';
import { getMemberMediaFeed } from '@/lib/sermons/service';
import type { MediaItem } from '@/lib/sermons/types';
import { getThumbnailUrl, getWatchUrl } from '@/lib/sermons/utils';

const typeConfig: Record<string, { color: string; icon: string }> = {
  'Sermon': { color: 'bg-ckc-gold/10 text-ckc-gold border-ckc-gold/20', icon: 'MicrophoneIcon' },
  'Audio': { color: 'bg-ckc-gold/10 text-ckc-gold border-ckc-gold/20', icon: 'MusicalNoteIcon' },
  'Book': { color: 'bg-ckc-gold/10 text-ckc-gold border-ckc-gold/20', icon: 'BookOpenIcon' },
  'Special Message': { color: 'bg-ckc-gold/10 text-ckc-gold border-ckc-gold/20', icon: 'SparklesIcon' },
};

const categoryColors: Record<string, string> = {
  'Sunday Service': 'bg-ckc-gold/10 text-ckc-gold',
  "Women's Day": 'bg-ckc-gold/10 text-ckc-gold',
  'Youth Conference': 'bg-ckc-gold/10 text-ckc-gold',
  'Prayer Meeting': 'bg-rose-500/10 text-rose-400',
  'Bible Study': 'bg-ckc-gold/10 text-ckc-gold',
  'Easter': 'bg-ckc-gold/10 text-ckc-gold',
  'Midweek Service': 'bg-ckc-gold/10 text-ckc-gold',
};

export default function SermonsPage() {
  const [sermons, setSermons] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedCampus, setFeedCampus] = useState<CampusId | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [preacherFilter, setPreacherFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedSermon, setSelectedSermon] = useState<MediaItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const session = getSession();
    const isGuest = !session || session.role === 'visitor';

    if (isGuest) {
      getMemberMediaFeed({ isVisitor: true })
        .then((items) => {
          setFeedCampus(null);
          setSermons(items);
        })
        .finally(() => setLoading(false));
      return;
    }

    fetchProfileByPhone(session.phone)
      .then(async (profile) => {
        const campus = (profile?.campusId as CampusId) ?? 'midrand';
        setFeedCampus(campus);
        const items = await getMemberMediaFeed({
          memberCampus: campus,
          isVisitor: false,
        });
        setSermons(items);
      })
      .catch(() => setSermons([]))
      .finally(() => setLoading(false));
  }, []);

  const preachers = ['All', ...Array.from(new Set(sermons.map((s) => s.preacher)))];
  const years = ['All', ...Array.from(new Set(sermons.map((s) => s.year.toString()))).sort((a, b) => Number(b) - Number(a))];
  const months = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const categories = ['All', ...Array.from(new Set(sermons.map((s) => s.category)))];

  const filtered = useMemo(() => {
    return sermons.filter((s) => {
      const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.preacher.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase()) ||
        (s.series?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchType = typeFilter === 'All' || s.type === typeFilter;
      const matchPreacher = preacherFilter === 'All' || s.preacher === preacherFilter;
      const matchYear = yearFilter === 'All' || s.year.toString() === yearFilter;
      const matchMonth = monthFilter === 'All' || s.month === monthFilter;
      const matchCategory = categoryFilter === 'All' || s.category === categoryFilter;
      return matchSearch && matchType && matchPreacher && matchYear && matchMonth && matchCategory;
    });
  }, [sermons, search, typeFilter, preacherFilter, yearFilter, monthFilter, categoryFilter]);

  // Group by type for organized display
  const grouped = useMemo(() => {
    const groups: Record<string, MediaItem[]> = {};
    filtered.forEach((s) => {
      if (!groups[s.type]) groups[s.type] = [];
      groups[s.type].push(s);
    });
    return groups;
  }, [filtered]);

  const hasFilters = typeFilter !== 'All' || preacherFilter !== 'All' || yearFilter !== 'All' || monthFilter !== 'All' || categoryFilter !== 'All' || search;

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('All');
    setPreacherFilter('All');
    setYearFilter('All');
    setMonthFilter('All');
    setCategoryFilter('All');
  };

  return (
    <AppShell access="shared">
      <div className="life-section space-y-3">
        <h1 className="text-base font-medium text-ckc-black">Sermons and messages</h1>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sermons"
          className="life-input"
        />

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`whitespace-nowrap rounded-md px-2.5 py-1 text-[10px] ${
              typeFilter !== 'All'
                ? 'bg-ckc-gold-button text-ckc-gold-text'
                : 'border border-[#E5E5E5] text-ckc-muted bg-white'
            }`}
          >
            <option value="All">Type</option>
            <option value="Sermon">Sermon</option>
            <option value="Audio">Audio</option>
            <option value="Book">Book</option>
            <option value="Special Message">Special Message</option>
          </select>
          <select
            value={preacherFilter}
            onChange={(e) => setPreacherFilter(e.target.value)}
            className={`whitespace-nowrap rounded-md px-2.5 py-1 text-[10px] ${
              preacherFilter !== 'All'
                ? 'bg-ckc-gold-button text-ckc-gold-text'
                : 'border border-[#E5E5E5] text-ckc-muted bg-white'
            }`}
          >
            {preachers.map((p) => (
              <option key={p} value={p}>{p === 'All' ? 'Preacher' : p}</option>
            ))}
          </select>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className={`whitespace-nowrap rounded-md px-2.5 py-1 text-[10px] ${
              yearFilter !== 'All'
                ? 'bg-ckc-gold-button text-ckc-gold-text'
                : 'border border-[#E5E5E5] text-ckc-muted bg-white'
            }`}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y === 'All' ? 'Year' : y}</option>
            ))}
          </select>
          {hasFilters && (
            <button type="button" onClick={clearFilters} className="text-[10px] text-ckc-muted">
              Clear
            </button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-16 text-ckc-muted text-sm">Loading messages…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Icon name="MagnifyingGlassIcon" size={32} variant="outline" className="text-ckc-black/20 mx-auto mb-3" />
            <p className="text-ckc-muted text-sm">No messages found matching your filters.</p>
            <button onClick={clearFilters} className="mt-2 text-xs text-ckc-gold hover:text-ckc-gold/80">Clear filters</button>
          </div>
        ) : hasFilters ? (
          // Flat grid when filtering
          <div className="grid grid-cols-2 gap-2">
            {filtered.map((sermon) => (
              <SermonCard key={sermon.id} sermon={sermon} viewMode="grid" onClick={() => setSelectedSermon(sermon)} />
            ))}
          </div>
        ) : (
          // Grouped by type when no filters
          <div className="space-y-8">
            {Object.entries(grouped).map(([type, sermons]) => (
              <div key={type}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${typeConfig[type]?.color}`}>
                    <Icon name={typeConfig[type]?.icon || 'PlayCircleIcon'} size={12} variant="outline" />
                    {type}s
                  </div>
                  <div className="flex-1 h-px bg-neutral-50" />
                  <span className="text-xs text-ckc-muted/80">{sermons.length} message{sermons.length !== 1 ? 's' : ''}</span>
                </div>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                  {sermons.map((sermon) => (
                    <SermonCard key={sermon.id} sermon={sermon} viewMode={viewMode} onClick={() => setSelectedSermon(sermon)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sermon Detail Modal */}
      {selectedSermon && (() => {
        const watchUrl = getWatchUrl(selectedSermon);
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedSermon(null)}>
          <div className="bg-ckc-black bg-neutral-50 border border-[#E5E5E5] rounded-2xl w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* YouTube Thumbnail */}
            <div className="relative aspect-video bg-black">
              {getThumbnailUrl(selectedSermon) ? (
                <img
                  src={getThumbnailUrl(selectedSermon)!}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-neutral-50">
                  <Icon name="MusicalNoteIcon" size={48} variant="outline" className="text-ckc-black/20" />
                </div>
              )}
              {watchUrl ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <a
                    href={watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-16 h-16 rounded-full bg-red-600/90 hover:bg-red-600 flex items-center justify-center transition-all hover:scale-110 shadow-2xl"
                  >
                    <Icon name="PlayIcon" size={24} variant="solid" className="text-white ml-1" />
                  </a>
                </div>
              ) : null}
              <button onClick={() => setSelectedSermon(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white/70 hover:text-white">
                <Icon name="XMarkIcon" size={16} variant="outline" />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-ckc-black font-bold text-base leading-snug">{selectedSermon.title}</h2>
                  {selectedSermon.series && <p className="text-ckc-gold text-xs mt-0.5">{selectedSermon.series}</p>}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border flex-shrink-0 ${typeConfig[selectedSermon.type]?.color}`}>
                  {selectedSermon.type}
                </span>
              </div>
              <p className="text-ckc-muted text-sm mb-4">{selectedSermon.description}</p>
              <div className="flex flex-wrap gap-3 text-xs text-ckc-muted">
                <span className="flex items-center gap-1"><Icon name="UserCircleIcon" size={12} variant="outline" />{selectedSermon.preacher}</span>
                <span className="flex items-center gap-1"><Icon name="CalendarDaysIcon" size={12} variant="outline" />{selectedSermon.date}</span>
                <span className="flex items-center gap-1"><Icon name="ClockIcon" size={12} variant="outline" />{selectedSermon.duration}</span>
                <span className={`px-2 py-0.5 rounded-full ${categoryColors[selectedSermon.category] || 'bg-neutral-50 text-ckc-muted'}`}>{selectedSermon.category}</span>
              </div>
              {watchUrl ? (
                <a
                  href={watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 font-semibold text-sm py-2.5 rounded-xl transition-all"
                >
                  <Icon name="PlayCircleIcon" size={16} variant="outline" />
                  {selectedSermon.youtubeId ? 'Watch on YouTube' : 'Open link'}
                </a>
              ) : (
                <p className="mt-4 text-center text-xs text-ckc-muted">No video link available for this message yet.</p>
              )}
            </div>
          </div>
        </div>
        );
      })()}
    </AppShell>
  );
}

function SermonCard({ sermon, viewMode, onClick }: { sermon: MediaItem; viewMode: 'grid' | 'list'; onClick: () => void }) {
  const cfg = typeConfig[sermon.type];
  const catColor = categoryColors[sermon.category] || 'bg-neutral-50 text-ckc-muted';
  const thumb = getThumbnailUrl(sermon);

  if (viewMode === 'list') {
    return (
      <button onClick={onClick} className="w-full flex items-center gap-4 bg-neutral-50 hover:bg-white/8 bg-neutral-50 border border-[#E5E5E5] hover:border-ckc-gold/20 rounded-xl p-3 transition-all text-left group">
        <div className="relative w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-black">
          {thumb ? (
            <img src={thumb} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-50">
              <Icon name="MusicalNoteIcon" size={20} variant="outline" className="text-ckc-muted/80" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
            <Icon name="PlayCircleIcon" size={20} variant="solid" className="text-white/80" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-ckc-black text-sm font-medium truncate">{sermon.title}</p>
          <p className="text-ckc-muted text-xs mt-0.5">{sermon.preacher} · {sermon.date}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg?.color}`}>{sermon.type}</span>
          <span className="text-xs text-ckc-muted/80">{sermon.duration}</span>
        </div>
      </button>
    );
  }

  return (
    <button onClick={onClick} className="w-full text-left">
      <div className="mb-1 h-[60px] rounded-lg bg-[#2a2a2a] overflow-hidden">
        {thumb ? (
          <img src={thumb} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <p className="text-[11px] text-ckc-black line-clamp-2">{sermon.title}</p>
      <p className="text-[9px] text-ckc-muted">{sermon.preacher}</p>
    </button>
  );
}
