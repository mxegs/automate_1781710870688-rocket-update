'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import { getAdminPrayerRequests, updatePrayerStatus } from '@/lib/prayer/service';
import { PRAYER_STATUS_LABELS, type PrayerRequest, type PrayerStatus } from '@/lib/prayer/types';
import { getCampusLabel } from '@/lib/church/constants';
import { useBackend } from '@/lib/api/client';

const statusColors: Record<string, string> = {
  new: 'bg-sky/10 text-sky border-sky/20',
  assigned: 'bg-amber-500/10 text-amber-400 border-amber-400/20',
  in_prayer: 'bg-purple-500/10 text-purple-400 border-purple-400/20',
  answered: 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20',
  closed: 'bg-white/5 text-cloud/40 border-white/10',
};

export default function PrayerRequestsPage() {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState<PrayerRequest | null>(null);
  const backend = useBackend();

  const load = async () => {
    setRequests(await getAdminPrayerRequests({ allCampuses: true }));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = requests.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatus = async (id: string, status: PrayerStatus) => {
    await updatePrayerStatus(id, status);
    load();
    setSelected(null);
  };

  return (
    <AppShell access="staff">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cloud tracking-tight">Prayer Requests</h1>
          <p className="text-cloud/40 text-sm mt-0.5">
            Submitted by members — campus pastors receive requests for their campus only
          </p>
        </div>
      </div>

      {!backend && (
        <p className="text-sm text-amber-400 mb-4">Connect Supabase to receive prayer requests from members.</p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Icon name="MagnifyingGlassIcon" size={16} variant="outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-cloud/30" />
          <input
            type="text"
            placeholder="Search requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-cloud"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud"
        >
          <option value="All">All statuses</option>
          {Object.entries(PRAYER_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelected(r)}
            className="w-full text-left rounded-xl border border-white/10 bg-white/5 p-4 hover:border-ckc-gold/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-cloud">
                  {r.isConfidential ? 'Confidential' : r.submitterName} — {r.title}
                </p>
                <p className="text-xs text-cloud/40 mt-1 line-clamp-1">{r.description}</p>
                <p className="text-xs text-cloud/30 mt-1">
                  {getCampusLabel(r.campus)} · {r.date}
                  {r.contactPhone && ` · ${r.contactPhone}`}
                  {r.contactEmail && ` · ${r.contactEmail}`}
                </p>
              </div>
              <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs ${statusColors[r.status]}`}>
                {PRAYER_STATUS_LABELS[r.status]}
              </span>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-cloud/40 py-12">No prayer requests yet.</p>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#1E293B] p-6">
            <h2 className="text-lg font-bold text-cloud">{selected.title}</h2>
            <p className="text-xs text-cloud/40 mt-1">
              {selected.isConfidential ? 'Confidential request' : selected.submitterName} · {getCampusLabel(selected.campus)}
            </p>
            <p className="text-sm text-cloud/70 mt-4 leading-relaxed">{selected.description}</p>
            {(selected.contactPhone || selected.contactEmail) && (
              <p className="text-xs text-cloud/40 mt-3">
                Contact: {selected.contactPhone} {selected.contactEmail}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {(['assigned', 'in_prayer', 'answered', 'closed'] as PrayerStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatus(selected.id, s)}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-cloud/60 hover:border-ckc-gold/30"
                >
                  Mark {PRAYER_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            <button onClick={() => setSelected(null)} className="mt-4 text-sm text-cloud/40">Close</button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
