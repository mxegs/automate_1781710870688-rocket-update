'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';

interface PrayerRequest {
  id: number;
  title: string;
  description: string;
  category: string;
  status: 'New' | 'Assigned' | 'In Prayer' | 'Answered' | 'Closed';
  date: string;
  isConfidential: boolean;
  submittedBy: string;
}

const myRequests: PrayerRequest[] = [
  { id: 1, title: 'Healing for my mother', description: 'Please pray for my mother who is recovering from surgery. We trust God for complete healing.', category: 'Health', status: 'In Prayer', date: '14 Jun 2025', isConfidential: false, submittedBy: 'me' },
  { id: 2, title: 'Job opportunity', description: 'I have an important interview next week. Please pray for favour and wisdom.', category: 'Employment', status: 'Assigned', date: '10 Jun 2025', isConfidential: false, submittedBy: 'me' },
  { id: 3, title: 'Family reconciliation', description: 'Confidential prayer request for family healing.', category: 'Family', status: 'New', date: '5 Jun 2025', isConfidential: true, submittedBy: 'me' },
];

const statusConfig: Record<string, { color: string; icon: string; label: string }> = {
  'New': { color: 'bg-sky/10 text-sky border-sky/20', icon: 'ClockIcon', label: 'New' },
  'Assigned': { color: 'bg-amber-500/10 text-amber-400 border-amber-400/20', icon: 'UserCircleIcon', label: 'Assigned to Prayer Team' },
  'In Prayer': { color: 'bg-purple-500/10 text-purple-400 border-purple-400/20', icon: 'HeartIcon', label: 'Being Prayed For' },
  'Answered': { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20', icon: 'CheckCircleIcon', label: 'Answered!' },
  'Closed': { color: 'bg-white/5 text-cloud/40 border-white/10', icon: 'XCircleIcon', label: 'Closed' },
};

const categories = ['Health', 'Family', 'Employment', 'Financial', 'Spiritual Growth', 'Relationships', 'Other'];

const categoryColors: Record<string, string> = {
  'Health': 'bg-rose-500/10 text-rose-400',
  'Family': 'bg-pink-500/10 text-pink-400',
  'Employment': 'bg-blue-500/10 text-blue-400',
  'Financial': 'bg-amber-500/10 text-amber-400',
  'Spiritual Growth': 'bg-emerald-500/10 text-emerald-400',
  'Relationships': 'bg-purple-500/10 text-purple-400',
  'Other': 'bg-white/5 text-cloud/40',
};

interface NewRequest {
  title: string;
  description: string;
  category: string;
  isConfidential: boolean;
}

export default function MemberPrayerPage() {
  const [requests, setRequests] = useState<PrayerRequest[]>(myRequests);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [submitted, setSubmitted] = useState(false);
  const [userName, setUserName] = useState('Member');
  const [form, setForm] = useState<NewRequest>({ title: '', description: '', category: 'Health', isConfidential: false });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = sessionStorage.getItem('church_user') || '';
      const name = email.split('@')[0] || 'Member';
      setUserName(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }, []);

  const filtered = requests.filter((r) => statusFilter === 'All' || r.status === statusFilter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: PrayerRequest = {
      id: Date.now(),
      title: form.title,
      description: form.description,
      category: form.category,
      status: 'New',
      date: new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }),
      isConfidential: form.isConfidential,
      submittedBy: 'me',
    };
    setRequests((prev) => [newReq, ...prev]);
    setForm({ title: '', description: '', category: 'Health', isConfidential: false });
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setShowForm(false); }, 2500);
  };

  const stats = {
    total: requests.length,
    inPrayer: requests.filter((r) => r.status === 'In Prayer').length,
    answered: requests.filter((r) => r.status === 'Answered').length,
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-cloud">Prayer Requests</h1>
            <p className="text-cloud/40 text-sm mt-0.5">Submit requests and track your prayer journey</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-sky/10 hover:bg-sky/20 border border-sky/20 text-sky text-sm font-medium px-4 py-2 rounded-xl transition-all"
          >
            <Icon name="PlusIcon" size={15} variant="outline" />
            New Request
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Requests', value: stats.total, color: 'text-sky', bg: 'bg-sky/5 border-sky/10' },
            { label: 'Being Prayed For', value: stats.inPrayer, color: 'text-purple-400', bg: 'bg-purple-500/5 border-purple-400/10' },
            { label: 'Answered', value: stats.answered, color: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-400/10' },
          ].map((s) => (
            <div key={s.label} className={`border rounded-xl p-3 text-center ${s.bg}`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-cloud/40 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* New Request Form */}
        {showForm && (
          <div className="bg-white/5 border border-sky/20 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-cloud mb-4 flex items-center gap-2">
              <Icon name="HeartIcon" size={14} variant="outline" className="text-rose-400" />
              Submit a Prayer Request
            </h2>
            {submitted ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-3">
                  <Icon name="CheckCircleIcon" size={24} variant="outline" className="text-emerald-400" />
                </div>
                <p className="text-cloud font-semibold text-sm">Your prayer request has been submitted.</p>
                <p className="text-cloud/40 text-xs mt-1">Our prayer team will be praying for you. 🙏</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-cloud/60 mb-1.5">Request Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    required
                    placeholder="Brief title for your request"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-cloud/60 mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    required
                    rows={3}
                    placeholder="Share your prayer need..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-cloud/60 mb-1.5">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud focus:outline-none focus:border-sky/50 transition-colors"
                    >
                      {categories.map((c) => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end pb-2.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isConfidential}
                        onChange={(e) => setForm((f) => ({ ...f, isConfidential: e.target.checked }))}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-sky focus:ring-sky/50"
                      />
                      <span className="text-xs text-cloud/60">Keep confidential</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-sky/10 hover:bg-sky/20 border border-sky/20 text-sky text-sm font-semibold py-2.5 rounded-xl transition-all">
                    Submit Request
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 bg-white/5 border border-white/10 text-cloud/50 text-sm rounded-xl hover:text-cloud transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {['All', 'New', 'Assigned', 'In Prayer', 'Answered', 'Closed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                statusFilter === s
                  ? s === 'All' ? 'bg-sky/20 text-sky border-sky/30' :
                    s === 'New' ? 'bg-sky/20 text-sky border-sky/30' :
                    s === 'Assigned' ? 'bg-amber-500/20 text-amber-400 border-amber-400/30' :
                    s === 'In Prayer' ? 'bg-purple-500/20 text-purple-400 border-purple-400/30' :
                    s === 'Answered'? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30' : 'bg-white/10 text-cloud/50 border-white/20' :'bg-white/5 text-cloud/40 border-white/10 hover:border-white/20 hover:text-cloud/60'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="HeartIcon" size={32} variant="outline" className="text-cloud/20 mx-auto mb-3" />
            <p className="text-cloud/40 text-sm">No prayer requests yet.</p>
            <button onClick={() => setShowForm(true)} className="mt-2 text-xs text-sky hover:text-sky/80">Submit your first request</button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((req) => {
              const sc = statusConfig[req.status];
              const catColor = categoryColors[req.category] || 'bg-white/5 text-cloud/40';
              return (
                <div key={req.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-sky/20 transition-all">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${catColor}`}>{req.category}</span>
                        {req.isConfidential && (
                          <span className="flex items-center gap-1 text-xs text-cloud/30">
                            <Icon name="LockClosedIcon" size={10} variant="outline" />
                            Confidential
                          </span>
                        )}
                      </div>
                      <h3 className="text-cloud font-semibold text-sm">{req.title}</h3>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border flex-shrink-0 flex items-center gap-1 ${sc.color}`}>
                      <Icon name={sc.icon} size={10} variant="outline" />
                      {req.status}
                    </span>
                  </div>
                  {!req.isConfidential && <p className="text-cloud/50 text-xs leading-relaxed mb-2">{req.description}</p>}
                  <div className="flex items-center justify-between">
                    <p className="text-cloud/30 text-xs">Submitted {req.date}</p>
                    <p className="text-xs text-cloud/40">{sc.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
