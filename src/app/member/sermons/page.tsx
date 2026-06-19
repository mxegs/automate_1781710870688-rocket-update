'use client';

import React, { useState, useMemo } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';

interface Sermon {
  id: number;
  title: string;
  preacher: string;
  date: string;
  month: string;
  year: number;
  type: 'Sermon' | 'Audio' | 'Book' | 'Special Message';
  category: string;
  youtubeId: string;
  duration: string;
  description: string;
  series?: string;
}

const mockSermons: Sermon[] = [
  { id: 1, title: 'Walking in Purpose', preacher: 'Pastor James Mokoena', date: '15 Jun 2025', month: 'June', year: 2025, type: 'Sermon', category: 'Sunday Service', youtubeId: 'dQw4w9WgXcQ', duration: '52 min', description: 'Discovering God\'s purpose for your life and walking boldly in it.', series: 'Purpose Series' },
  { id: 2, title: 'Faith Over Fear', preacher: 'Pastor James Mokoena', date: '8 Jun 2025', month: 'June', year: 2025, type: 'Sermon', category: 'Sunday Service', youtubeId: 'L_jWHffIx5E', duration: '48 min', description: 'How to overcome fear through unwavering faith in God.', series: 'Purpose Series' },
  { id: 3, title: 'Women of Strength — Women\'s Day 2025', preacher: 'Pastor Sarah Dlamini', date: '9 Aug 2025', month: 'August', year: 2025, type: 'Special Message', category: "Women's Day", youtubeId: 'kJQP7kiw5Fk', duration: '61 min', description: 'A powerful message celebrating the strength and grace of women in the church.', series: "Women's Day 2025" },
  { id: 4, title: 'Rise Up — Youth Conference 2025', preacher: 'Evangelist Thabo Sithole', date: '5 Apr 2025', month: 'April', year: 2025, type: 'Special Message', category: 'Youth Conference', youtubeId: 'fJ9rUzIMcZQ', duration: '55 min', description: 'A fire-filled message for the next generation to rise and take their place.', series: 'Youth Conference 2025' },
  { id: 5, title: 'The Power of Prayer', preacher: 'Pastor James Mokoena', date: '1 Jun 2025', month: 'June', year: 2025, type: 'Audio', category: 'Prayer Meeting', youtubeId: 'OPf0YbXqDm0', duration: '38 min', description: 'Understanding the transformative power of a consistent prayer life.' },
  { id: 6, title: 'Knowing God Deeply', preacher: 'Elder Ruth Khumalo', date: '25 May 2025', month: 'May', year: 2025, type: 'Sermon', category: 'Sunday Service', youtubeId: 'hT_nvWreIhg', duration: '44 min', description: 'A deep dive into intimacy with God through His Word and Spirit.' },
  { id: 7, title: 'Foundations of Faith', preacher: 'Pastor James Mokoena', date: '18 May 2025', month: 'May', year: 2025, type: 'Sermon', category: 'Sunday Service', youtubeId: 'CevxZvSJLk8', duration: '50 min', description: 'Building your life on the unshakeable foundation of Christ.', series: 'Foundations Series' },
  { id: 8, title: 'Transformed by Grace', preacher: 'Elder Ruth Khumalo', date: '11 May 2025', month: 'May', year: 2025, type: 'Sermon', category: 'Sunday Service', youtubeId: 'JGwWNGJdvx8', duration: '46 min', description: 'How God\'s grace transforms every area of our lives.' },
  { id: 9, title: 'Discipleship: The Call to Follow', preacher: 'Pastor James Mokoena', date: '4 May 2025', month: 'May', year: 2025, type: 'Book', category: 'Bible Study', youtubeId: 'RgKAFK5djSk', duration: '35 min', description: 'A study guide companion for the discipleship series.' },
  { id: 10, title: 'Easter Sunday — He Is Risen!', preacher: 'Pastor James Mokoena', date: '20 Apr 2025', month: 'April', year: 2025, type: 'Special Message', category: 'Easter', youtubeId: 'YQHsXMglC9A', duration: '58 min', description: 'Celebrating the resurrection of Jesus Christ and what it means for us today.', series: 'Easter 2025' },
  { id: 11, title: 'Healing in His Wings', preacher: 'Pastor Sarah Dlamini', date: '13 Apr 2025', month: 'April', year: 2025, type: 'Sermon', category: 'Sunday Service', youtubeId: 'nfWlot6h_JM', duration: '49 min', description: 'God\'s promise of healing — physical, emotional, and spiritual.' },
  { id: 12, title: 'The Fruit of the Spirit', preacher: 'Elder Ruth Khumalo', date: '6 Apr 2025', month: 'April', year: 2025, type: 'Audio', category: 'Midweek Service', youtubeId: 'PT2_F-1esPk', duration: '41 min', description: 'Growing in the nine fruits of the Spirit in everyday life.' },
];

const typeConfig: Record<string, { color: string; icon: string }> = {
  'Sermon': { color: 'bg-sky/10 text-sky border-sky/20', icon: 'MicrophoneIcon' },
  'Audio': { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20', icon: 'MusicalNoteIcon' },
  'Book': { color: 'bg-amber-500/10 text-amber-400 border-amber-400/20', icon: 'BookOpenIcon' },
  'Special Message': { color: 'bg-purple-500/10 text-purple-400 border-purple-400/20', icon: 'SparklesIcon' },
};

const categoryColors: Record<string, string> = {
  'Sunday Service': 'bg-sky/10 text-sky',
  "Women's Day": 'bg-pink-500/10 text-pink-400',
  'Youth Conference': 'bg-purple-500/10 text-purple-400',
  'Prayer Meeting': 'bg-rose-500/10 text-rose-400',
  'Bible Study': 'bg-emerald-500/10 text-emerald-400',
  'Easter': 'bg-amber-500/10 text-amber-400',
  'Midweek Service': 'bg-blue-500/10 text-blue-400',
};

export default function SermonsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [preacherFilter, setPreacherFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const preachers = ['All', ...Array.from(new Set(mockSermons.map((s) => s.preacher)))];
  const years = ['All', ...Array.from(new Set(mockSermons.map((s) => s.year.toString()))).sort((a, b) => Number(b) - Number(a))];
  const months = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const categories = ['All', ...Array.from(new Set(mockSermons.map((s) => s.category)))];

  const filtered = useMemo(() => {
    return mockSermons.filter((s) => {
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
  }, [search, typeFilter, preacherFilter, yearFilter, monthFilter, categoryFilter]);

  // Group by type for organized display
  const grouped = useMemo(() => {
    const groups: Record<string, Sermon[]> = {};
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
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-cloud">Messages & Sermons</h1>
            <p className="text-cloud/40 text-sm mt-0.5">Sermons, audio messages, books, and special events</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg border transition-colors ${viewMode === 'grid' ? 'bg-sky/10 border-sky/20 text-sky' : 'bg-white/5 border-white/10 text-cloud/40 hover:text-cloud'}`}
            >
              <Icon name="Squares2X2Icon" size={16} variant="outline" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg border transition-colors ${viewMode === 'list' ? 'bg-sky/10 border-sky/20 text-sky' : 'bg-white/5 border-white/10 text-cloud/40 hover:text-cloud'}`}
            >
              <Icon name="ListBulletIcon" size={16} variant="outline" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Icon name="MagnifyingGlassIcon" size={16} variant="outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-cloud/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, preacher, series..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-cloud/70 focus:outline-none focus:border-sky/50 transition-colors">
            <option value="All" className="bg-slate-800">All Types</option>
            <option value="Sermon" className="bg-slate-800">Sermons</option>
            <option value="Audio" className="bg-slate-800">Audio</option>
            <option value="Book" className="bg-slate-800">Books</option>
            <option value="Special Message" className="bg-slate-800">Special Messages</option>
          </select>
          <select value={preacherFilter} onChange={(e) => setPreacherFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-cloud/70 focus:outline-none focus:border-sky/50 transition-colors">
            {preachers.map((p) => <option key={p} value={p} className="bg-slate-800">{p === 'All' ? 'All Preachers' : p}</option>)}
          </select>
          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-cloud/70 focus:outline-none focus:border-sky/50 transition-colors">
            {years.map((y) => <option key={y} value={y} className="bg-slate-800">{y === 'All' ? 'All Years' : y}</option>)}
          </select>
          <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-cloud/70 focus:outline-none focus:border-sky/50 transition-colors">
            {months.map((m) => <option key={m} value={m} className="bg-slate-800">{m === 'All' ? 'All Months' : m}</option>)}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-cloud/70 focus:outline-none focus:border-sky/50 transition-colors">
            {categories.map((c) => <option key={c} value={c} className="bg-slate-800">{c === 'All' ? 'All Categories' : c}</option>)}
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-cloud/40 hover:text-rose-400 flex items-center gap-1 px-2 py-2 rounded-lg hover:bg-rose-500/5 transition-colors">
              <Icon name="XMarkIcon" size={12} variant="outline" />
              Clear
            </button>
          )}
          <span className="text-xs text-cloud/30 ml-auto">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Type filter quick pills */}
        <div className="flex gap-2 flex-wrap">
          {['All', 'Sermon', 'Audio', 'Book', 'Special Message'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                typeFilter === t
                  ? t === 'All' ? 'bg-sky/20 text-sky border-sky/30' :
                    t === 'Sermon' ? 'bg-sky/20 text-sky border-sky/30' :
                    t === 'Audio' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30' :
                    t === 'Book'? 'bg-amber-500/20 text-amber-400 border-amber-400/30' : 'bg-purple-500/20 text-purple-400 border-purple-400/30' :'bg-white/5 text-cloud/40 border-white/10 hover:border-white/20 hover:text-cloud/60'
              }`}
            >
              {t === 'All' ? `All (${mockSermons.length})` : `${t} (${mockSermons.filter((s) => s.type === t).length})`}
            </button>
          ))}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Icon name="MagnifyingGlassIcon" size={32} variant="outline" className="text-cloud/20 mx-auto mb-3" />
            <p className="text-cloud/40 text-sm">No messages found matching your filters.</p>
            <button onClick={clearFilters} className="mt-2 text-xs text-sky hover:text-sky/80">Clear filters</button>
          </div>
        ) : hasFilters ? (
          // Flat grid when filtering
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
            {filtered.map((sermon) => (
              <SermonCard key={sermon.id} sermon={sermon} viewMode={viewMode} onClick={() => setSelectedSermon(sermon)} />
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
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-xs text-cloud/30">{sermons.length} message{sermons.length !== 1 ? 's' : ''}</span>
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
      {selectedSermon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedSermon(null)}>
          <div className="bg-[#0F172A] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* YouTube Thumbnail */}
            <div className="relative aspect-video bg-black">
              <img
                src={`https://img.youtube.com/vi/${selectedSermon.youtubeId}/maxresdefault.jpg`}
                alt={`Thumbnail for ${selectedSermon.title}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <a
                  href={`https://www.youtube.com/watch?v=${selectedSermon.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-16 h-16 rounded-full bg-red-600/90 hover:bg-red-600 flex items-center justify-center transition-all hover:scale-110 shadow-2xl"
                >
                  <Icon name="PlayIcon" size={24} variant="solid" className="text-white ml-1" />
                </a>
              </div>
              <button onClick={() => setSelectedSermon(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white/70 hover:text-white">
                <Icon name="XMarkIcon" size={16} variant="outline" />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-cloud font-bold text-base leading-snug">{selectedSermon.title}</h2>
                  {selectedSermon.series && <p className="text-sky text-xs mt-0.5">{selectedSermon.series}</p>}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border flex-shrink-0 ${typeConfig[selectedSermon.type]?.color}`}>
                  {selectedSermon.type}
                </span>
              </div>
              <p className="text-cloud/50 text-sm mb-4">{selectedSermon.description}</p>
              <div className="flex flex-wrap gap-3 text-xs text-cloud/40">
                <span className="flex items-center gap-1"><Icon name="UserCircleIcon" size={12} variant="outline" />{selectedSermon.preacher}</span>
                <span className="flex items-center gap-1"><Icon name="CalendarDaysIcon" size={12} variant="outline" />{selectedSermon.date}</span>
                <span className="flex items-center gap-1"><Icon name="ClockIcon" size={12} variant="outline" />{selectedSermon.duration}</span>
                <span className={`px-2 py-0.5 rounded-full ${categoryColors[selectedSermon.category] || 'bg-white/5 text-cloud/40'}`}>{selectedSermon.category}</span>
              </div>
              <a
                href={`https://www.youtube.com/watch?v=${selectedSermon.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 font-semibold text-sm py-2.5 rounded-xl transition-all"
              >
                <Icon name="PlayCircleIcon" size={16} variant="outline" />
                Watch on YouTube
              </a>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function SermonCard({ sermon, viewMode, onClick }: { sermon: Sermon; viewMode: 'grid' | 'list'; onClick: () => void }) {
  const cfg = typeConfig[sermon.type];
  const catColor = categoryColors[sermon.category] || 'bg-white/5 text-cloud/40';

  if (viewMode === 'list') {
    return (
      <button onClick={onClick} className="w-full flex items-center gap-4 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-sky/20 rounded-xl p-3 transition-all text-left group">
        <div className="relative w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-black">
          <img src={`https://img.youtube.com/vi/${sermon.youtubeId}/mqdefault.jpg`} alt={`Thumbnail for ${sermon.title}`} className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
            <Icon name="PlayCircleIcon" size={20} variant="solid" className="text-white/80" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-cloud text-sm font-medium truncate">{sermon.title}</p>
          <p className="text-cloud/40 text-xs mt-0.5">{sermon.preacher} · {sermon.date}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg?.color}`}>{sermon.type}</span>
          <span className="text-xs text-cloud/30">{sermon.duration}</span>
        </div>
      </button>
    );
  }

  return (
    <button onClick={onClick} className="w-full bg-white/5 hover:bg-white/8 border border-white/10 hover:border-sky/20 rounded-xl overflow-hidden transition-all text-left group hover:scale-[1.01]">
      <div className="relative aspect-video bg-black">
        <img src={`https://img.youtube.com/vi/${sermon.youtubeId}/mqdefault.jpg`} alt={`Thumbnail for ${sermon.title}`} className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
          <div className="w-10 h-10 rounded-full bg-red-600/80 group-hover:bg-red-600 flex items-center justify-center transition-all group-hover:scale-110">
            <Icon name="PlayIcon" size={16} variant="solid" className="text-white ml-0.5" />
          </div>
        </div>
        <div className="absolute top-2 left-2">
          <span className={`text-xs px-2 py-0.5 rounded-full border backdrop-blur-sm ${cfg?.color}`}>{sermon.type}</span>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-mono">{sermon.duration}</div>
      </div>
      <div className="p-3">
        <h3 className="text-cloud text-sm font-semibold leading-snug line-clamp-2 mb-1">{sermon.title}</h3>
        {sermon.series && <p className="text-sky text-xs mb-1 truncate">{sermon.series}</p>}
        <div className="flex items-center justify-between gap-2">
          <p className="text-cloud/40 text-xs truncate">{sermon.preacher}</p>
          <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${catColor}`}>{sermon.category}</span>
        </div>
        <p className="text-cloud/30 text-xs mt-1">{sermon.date}</p>
      </div>
    </button>
  );
}
