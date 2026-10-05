'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import { formatPhoneDisplay } from '@/lib/auth/session';
import { getCampusLabel } from '@/lib/church/constants';
import { resolveMemberChurch } from '@/lib/member/campus';
import {
  createVisitor,
  formatVisitDate,
  getVisitors,
  visitorNotesText,
  visitorSourceLabel,
  type VisitorRow,
} from '@/lib/visitors/service';

const SOURCE_OPTIONS = ['Sunday service', 'Friend', 'Family', 'Social media', 'Walk-in', 'Outreach', 'Other'];

function sourceCounts(rows: VisitorRow[]): { source: string; count: number }[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const key = visitorSourceLabel(row.source);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count || a.source.localeCompare(b.source));
}

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<VisitorRow[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'Walk-in',
    firstVisitAt: '',
    notes: '',
  });

  const load = () => {
    setLoading(true);
    getVisitors(resolveMemberChurch())
      .then((rows) => {
        setVisitors(rows);
        setError('');
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Could not load visitors');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const breakdown = useMemo(() => sourceCounts(visitors), [visitors]);

  const filtered = visitors.filter((v) => {
    const q = search.toLowerCase();
    const hay = `${v.name} ${v.email ?? ''} ${visitorSourceLabel(v.source)} ${v.phone ?? ''}`.toLowerCase();
    const matchSearch = !q || hay.includes(q);
    const matchSource = sourceFilter === 'All' || visitorSourceLabel(v.source) === sourceFilter;
    return matchSearch && matchSource;
  });

  const submitRegister = async () => {
    setSaving(true);
    setError('');
    try {
      await createVisitor(
        {
          name: form.name,
          phone: form.phone,
          email: form.email,
          source: form.source,
          notes: form.notes,
          firstVisitAt: form.firstVisitAt,
        },
        resolveMemberChurch(),
      );
      setShowAddModal(false);
      setForm({ name: '', phone: '', email: '', source: 'Walk-in', firstVisitAt: '', notes: '' });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not register visitor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell access="staff">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cloud tracking-tight">Visitor Tracking</h1>
          <p className="text-cloud/40 text-sm mt-0.5">
            {loading ? 'Loading…' : `${visitors.length} visitors tracked`}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-ckc-gold text-ckc-black font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-ckc-gold/90 transition-colors"
        >
          <Icon name="PlusIcon" size={16} variant="outline" />
          Register Visitor
        </button>
      </div>

      {error ? <p className="text-sm text-rose-400 mb-4">{error}</p> : null}

      {breakdown.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
          {breakdown.map((row) => (
            <button
              key={row.source}
              onClick={() => setSourceFilter(sourceFilter === row.source ? 'All' : row.source)}
              className={`p-3 rounded-lg border text-left transition-all ${
                sourceFilter === row.source
                  ? 'border-ckc-gold/40 bg-ckc-gold/5'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <p className="text-lg font-bold text-cloud font-mono">{row.count}</p>
              <p className="text-xs text-cloud/40 leading-tight mt-0.5">{row.source}</p>
            </button>
          ))}
        </div>
      )}

      <div className="relative mb-5">
        <Icon
          name="MagnifyingGlassIcon"
          size={16}
          variant="outline"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-cloud/30"
        />
        <input
          type="text"
          placeholder="Search visitors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-cloud placeholder-cloud/30 focus:outline-none focus:border-ckc-gold/50 transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((visitor) => {
          const notes = visitorNotesText(visitor.notes);
          return (
            <div
              key={visitor.id}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-ckc-gold/20 transition-colors cursor-pointer"
              onClick={() => setSelectedVisitor(visitor)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-ckc-gold/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-ckc-gold">{visitor.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-cloud">{visitor.name}</p>
                    <p className="text-xs text-cloud/40">via {visitorSourceLabel(visitor.source)}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-cloud/50">
                  <Icon name="CalendarDaysIcon" size={12} variant="outline" />
                  <span>First visit: {formatVisitDate(visitor.first_visit_at || visitor.created_at)}</span>
                </div>
                {visitor.phone && (
                  <div className="flex items-center gap-2 text-xs text-cloud/50">
                    <Icon name="PhoneIcon" size={12} variant="outline" />
                    <span>{formatPhoneDisplay(visitor.phone)}</span>
                  </div>
                )}
              </div>
              {notes ? (
                <p className="text-xs text-cloud/30 mt-3 pt-3 border-t border-white/5 line-clamp-1">{notes}</p>
              ) : null}
            </div>
          );
        })}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-cloud/30">
          <Icon name="UserPlusIcon" size={32} variant="outline" className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No visitors found</p>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-ckc-card border border-white/10 rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-cloud">Register Visitor</h2>
              <button onClick={() => setShowAddModal(false)} className="text-cloud/40 hover:text-cloud">
                <Icon name="XMarkIcon" size={20} variant="outline" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud focus:outline-none focus:border-ckc-gold/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud focus:outline-none focus:border-ckc-gold/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud focus:outline-none focus:border-ckc-gold/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">How did they hear about us?</label>
                <select
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud focus:outline-none focus:border-ckc-gold/50 transition-colors"
                >
                  {SOURCE_OPTIONS.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Date of First Visit</label>
                <input
                  type="date"
                  value={form.firstVisitAt}
                  onChange={(e) => setForm({ ...form, firstVisitAt: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud focus:outline-none focus:border-ckc-gold/50 transition-colors"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Notes</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-ckc-gold/50 transition-colors resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-white/5 border border-white/10 text-cloud/70 text-sm font-semibold py-2.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => void submitRegister()}
                disabled={saving || !form.name.trim()}
                className="flex-1 bg-ckc-gold text-ckc-black text-sm font-bold py-2.5 rounded-lg hover:bg-ckc-gold/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Register Visitor'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-ckc-card border border-white/10 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-cloud">Visitor Details</h2>
              <button onClick={() => setSelectedVisitor(null)} className="text-cloud/40 hover:text-cloud">
                <Icon name="XMarkIcon" size={20} variant="outline" />
              </button>
            </div>
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-white/10">
              <div className="w-12 h-12 rounded-full bg-ckc-gold/10 flex items-center justify-center">
                <span className="text-lg font-bold text-ckc-gold">{selectedVisitor.name.charAt(0)}</span>
              </div>
              <div>
                <p className="text-base font-bold text-cloud">{selectedVisitor.name}</p>
                <p className="text-xs text-cloud/40">{visitorSourceLabel(selectedVisitor.source)}</p>
              </div>
            </div>
            <div className="space-y-3 mb-5">
              {[
                {
                  label: 'Phone',
                  value: selectedVisitor.phone ? formatPhoneDisplay(selectedVisitor.phone) : '—',
                  icon: 'PhoneIcon',
                },
                { label: 'Email', value: selectedVisitor.email || '—', icon: 'EnvelopeIcon' },
                {
                  label: 'First Visit',
                  value: formatVisitDate(selectedVisitor.first_visit_at || selectedVisitor.created_at),
                  icon: 'CalendarDaysIcon',
                },
                { label: 'Source', value: visitorSourceLabel(selectedVisitor.source), icon: 'LinkIcon' },
                {
                  label: 'Campus',
                  value: selectedVisitor.campus_id ? getCampusLabel(selectedVisitor.campus_id) : '—',
                  icon: 'MapPinIcon',
                },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <Icon name={row.icon} size={14} variant="outline" className="text-cloud/30 flex-shrink-0" />
                  <span className="text-xs text-cloud/40 w-16">{row.label}</span>
                  <span className="text-sm text-cloud">{row.value}</span>
                </div>
              ))}
            </div>
            {visitorNotesText(selectedVisitor.notes) ? (
              <div className="bg-white/5 rounded-lg p-3 mb-5">
                <p className="text-xs text-cloud/40 mb-1">Notes</p>
                <p className="text-sm text-cloud/70">{visitorNotesText(selectedVisitor.notes)}</p>
              </div>
            ) : null}
            <button
              onClick={() => setSelectedVisitor(null)}
              className="w-full bg-ckc-gold text-ckc-black text-sm font-bold py-2.5 rounded-lg hover:bg-ckc-gold/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
