'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import LifeHero from '@/components/church-life/LifeHero';
import LifePhoto from '@/components/church-life/LifePhoto';
import { LIFE_PHOTOS } from '@/lib/church-life/imagery';
import { type CampusId } from '@/lib/church/constants';
import { fetchProfileByPhone, getSession } from '@/lib/auth/session';
import { resolveMemberChurch } from '@/lib/member/campus';
import { getMemberMediaFeed } from '@/lib/sermons/service';
import type { MediaItem } from '@/lib/sermons/types';
import { getThumbnailUrl, getWatchUrl } from '@/lib/sermons/utils';

const FILTER_CHIP =
  'whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium';

export default function SermonsPage() {
  const [sermons, setSermons] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [preacherFilter, setPreacherFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedSermon, setSelectedSermon] = useState<MediaItem | null>(null);

  useEffect(() => {
    const session = getSession();
    const isGuest = !session || session.role === 'visitor';

    if (isGuest) {
      getMemberMediaFeed({ churchId: resolveMemberChurch(), isVisitor: true })
        .then((items) => setSermons(items))
        .finally(() => setLoading(false));
      return;
    }

    fetchProfileByPhone(session.phone)
      .then(async (profile) => {
        const campus = (profile?.campusId as CampusId) ?? 'midrand';
        const items = await getMemberMediaFeed({
          churchId: resolveMemberChurch(),
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

  const filtered = useMemo(() => {
    return sermons.filter((s) => {
      const matchSearch =
        s.title.toLowerCase().includes(search.toLowerCase()) ||
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

  const hasFilters =
    typeFilter !== 'All' ||
    preacherFilter !== 'All' ||
    yearFilter !== 'All' ||
    monthFilter !== 'All' ||
    categoryFilter !== 'All' ||
    search;

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('All');
    setPreacherFilter('All');
    setYearFilter('All');
    setMonthFilter('All');
    setCategoryFilter('All');
  };

  const featured = !hasFilters ? filtered[0] : null;
  const rest = featured ? filtered.slice(1) : filtered;
  const chipClass = (active: boolean) =>
    `${FILTER_CHIP} ${active ? 'border-ckc-gold bg-ckc-gold text-ckc-gold-text' : 'border-[#C9BBAE] bg-white text-ckc-black'}`;

  return (
    <AppShell access="shared">
      <div className="px-5 pb-8 pt-5">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h1 className="font-serif text-[32px] font-semibold leading-none text-ckc-black">Sermons</h1>
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-ckc-gold-dim">Library</span>
        </div>

        {featured ? (
          <div className="mb-5">
            <LifeHero
              imageUrl={getThumbnailUrl(featured)}
              titleLead={featured.title}
              titleRest={`${featured.preacher} · ${featured.date}`}
              badge="Latest sermon"
              cta="Watch"
              onClick={() => setSelectedSermon(featured)}
            />
          </div>
        ) : (
          <div className="mb-5">
            <LifeHero
              imageUrl={LIFE_PHOTOS.worship}
              titleLead="Watch with us"
              titleRest="Sunday messages and special gatherings"
              badge="Sermon library"
            />
          </div>
        )}

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sermons"
          className="life-input mb-3"
        />

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={chipClass(typeFilter !== 'All')}>
            <option value="All">All</option>
            <option value="Sermon">Sermon</option>
            <option value="Audio">Audio</option>
            <option value="Book">Book</option>
            <option value="Special Message">Special Message</option>
          </select>
          <select
            value={preacherFilter}
            onChange={(e) => setPreacherFilter(e.target.value)}
            className={chipClass(preacherFilter !== 'All')}
          >
            {preachers.map((p) => (
              <option key={p} value={p}>
                {p === 'All' ? 'Preacher' : p}
              </option>
            ))}
          </select>
          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className={chipClass(yearFilter !== 'All')}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y === 'All' ? 'Year' : y}
              </option>
            ))}
          </select>
          {hasFilters ? (
            <button type="button" onClick={clearFilters} className="text-xs font-medium text-ckc-gold-dim">
              Clear
            </button>
          ) : null}
        </div>

        {loading ? (
          <p className="py-16 text-center text-sm text-ckc-muted">Loading messages…</p>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-ckc-muted">No messages match those filters.</p>
            <button type="button" onClick={clearFilters} className="mt-2 text-sm font-medium text-ckc-gold-dim">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {(featured ? rest : filtered).map((sermon) => (
              <SermonCard key={sermon.id} sermon={sermon} onClick={() => setSelectedSermon(sermon)} />
            ))}
          </div>
        )}
      </div>

      {selectedSermon &&
        (() => {
          const watchUrl = getWatchUrl(selectedSermon);
          const thumb = getThumbnailUrl(selectedSermon);
          return (
            <div
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
              onClick={() => setSelectedSermon(null)}
            >
              <div
                className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-ckc-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative aspect-[16/10] bg-ckc-black">
                  <LifePhoto src={thumb} className="h-full w-full" />
                  {watchUrl ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <a
                        href={watchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl transition hover:scale-105"
                      >
                        <Icon name="PlayIcon" size={24} variant="solid" className="ml-0.5 text-ckc-black" />
                      </a>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setSelectedSermon(null)}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white"
                  >
                    <Icon name="XMarkIcon" size={16} variant="outline" />
                  </button>
                </div>
                <div className="p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ckc-gold-dim">
                    {selectedSermon.type}
                  </p>
                  <h2 className="mt-1 font-serif text-[24px] font-semibold leading-tight text-ckc-black">
                    {selectedSermon.title}
                  </h2>
                  {selectedSermon.series ? (
                    <p className="mt-1 text-sm text-ckc-gold-dim">{selectedSermon.series}</p>
                  ) : null}
                  <p className="mt-3 text-sm leading-relaxed text-ckc-muted">{selectedSermon.description}</p>
                  <p className="mt-3 text-sm text-ckc-muted">
                    {selectedSermon.preacher} · {selectedSermon.date}
                    {selectedSermon.duration ? ` · ${selectedSermon.duration}` : ''}
                  </p>
                  {watchUrl ? (
                    <a
                      href={watchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-life-primary mt-5 flex w-full items-center justify-center py-3.5"
                    >
                      {selectedSermon.youtubeId ? 'Watch on YouTube' : 'Open message'}
                    </a>
                  ) : (
                    <p className="mt-5 text-center text-sm text-ckc-muted">No video link yet for this message.</p>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
    </AppShell>
  );
}

function SermonCard({ sermon, onClick }: { sermon: MediaItem; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full overflow-hidden rounded-[22px] bg-white text-left shadow-[0_10px_28px_rgba(26,22,18,0.08)]">
      <div className="relative h-[132px]">
        <LifePhoto src={getThumbnailUrl(sermon)} className="h-full w-full" />
        <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-ckc-black">
          <Icon name="PlayIcon" size={12} variant="solid" className="ml-0.5" />
        </span>
      </div>
      <div className="px-3 py-3">
        <p className="line-clamp-2 text-[14px] font-semibold leading-snug text-ckc-black">{sermon.title}</p>
        <p className="mt-1 text-xs text-ckc-muted">
          {sermon.preacher} · {sermon.date}
        </p>
      </div>
    </button>
  );
}
