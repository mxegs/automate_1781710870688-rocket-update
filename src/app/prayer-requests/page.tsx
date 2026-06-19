'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';

interface PrayerRequest {
  id: number;
  name: string;
  anonymous: boolean;
  category: string;
  request: string;
  status: string;
  date: string;
  assignedTo?: string;
  confidential: boolean;
}

const mockRequests: PrayerRequest[] = [
  { id: 1, name: 'John Sithole', anonymous: false, category: 'Employment', request: 'Please pray for my job search. I have been unemployed for 3 months and need God\'s provision.', status: 'New', date: '15 Jun 2025', confidential: false },
  { id: 2, name: 'Anonymous', anonymous: true, category: 'Health', request: 'Healing from a serious illness. Doctors have given a difficult diagnosis.', status: 'In Prayer', date: '14 Jun 2025', assignedTo: 'Prayer Team A', confidential: true },
  { id: 3, name: 'Mary Khumalo', anonymous: false, category: 'Family', request: 'Restoration in my marriage. We are going through a difficult season.', status: 'Assigned', date: '13 Jun 2025', assignedTo: 'Pastor Dlamini', confidential: false },
  { id: 4, name: 'David Nkosi', anonymous: false, category: 'Spiritual Growth', request: 'I want to grow deeper in my faith and find my purpose in the church.', status: 'Answered', date: '10 Jun 2025', confidential: false },
  { id: 5, name: 'Anonymous', anonymous: true, category: 'Financial', request: 'Struggling with debt and financial pressure. Need God\'s breakthrough.', status: 'In Prayer', date: '12 Jun 2025', assignedTo: 'Prayer Team B', confidential: true },
  { id: 6, name: 'Grace Mokoena', anonymous: false, category: 'Health', request: 'My mother is in hospital. Please pray for her recovery.', status: 'New', date: '15 Jun 2025', confidential: false },
  { id: 7, name: 'Sipho Dlamini', anonymous: false, category: 'Other', request: 'Guidance for a major life decision I need to make this month.', status: 'Closed', date: '5 Jun 2025', confidential: false },
];

const statusColors: Record<string, string> = {
  New: 'bg-sky/10 text-sky border-sky/20',
  Assigned: 'bg-amber-500/10 text-amber-400 border-amber-400/20',
  'In Prayer': 'bg-purple-500/10 text-purple-400 border-purple-400/20',
  Answered: 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20',
  Closed: 'bg-white/5 text-cloud/40 border-white/10',
};

const categoryColors: Record<string, string> = {
  Health: 'bg-rose-500/10 text-rose-400',
  Family: 'bg-pink-500/10 text-pink-400',
  Employment: 'bg-amber-500/10 text-amber-400',
  Financial: 'bg-orange-500/10 text-orange-400',
  'Spiritual Growth': 'bg-purple-500/10 text-purple-400',
  Other: 'bg-white/10 text-cloud/50',
};

const statuses = ['New', 'Assigned', 'In Prayer', 'Answered', 'Closed'];
const categories = ['All', 'Health', 'Family', 'Employment', 'Financial', 'Spiritual Growth', 'Other'];

export default function PrayerRequestsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PrayerRequest | null>(null);

  const filtered = mockRequests.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.request.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchCat = categoryFilter === 'All' || r.category === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  });

  const counts = statuses.reduce((acc, s) => {
    acc[s] = mockRequests.filter((r) => r.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AppShell access="staff">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cloud tracking-tight">Prayer Requests</h1>
          <p className="text-cloud/40 text-sm mt-0.5">{mockRequests.filter((r) => r.status !== 'Closed').length} active requests</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-sky text-slate-dark font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-sky/90 transition-colors"
        >
          <Icon name="PlusIcon" size={16} variant="outline" />
          New Request
        </button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(statusFilter === s ? 'All' : s)}
            className={`p-3 rounded-lg border text-left transition-all ${
              statusFilter === s ? 'border-sky/40 bg-sky/5' : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <p className="text-xl font-bold text-cloud font-mono">{counts[s] || 0}</p>
            <p className="text-xs text-cloud/40 leading-tight mt-0.5">{s}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Icon name="MagnifyingGlassIcon" size={16} variant="outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-cloud/30" />
          <input
            type="text"
            placeholder="Search requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-cloud placeholder-cloud/30 focus:outline-none focus:border-sky/50 transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                categoryFilter === c
                  ? 'bg-sky/10 text-sky border-sky/30' :'bg-white/5 text-cloud/50 border-white/10 hover:text-cloud hover:border-white/20'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Request cards */}
      <div className="space-y-3">
        {filtered.map((req) => (
          <div
            key={req.id}
            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-sky/20 transition-colors cursor-pointer"
            onClick={() => setSelectedRequest(req)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full bg-sky/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {req.anonymous ? (
                    <Icon name="EyeSlashIcon" size={16} variant="outline" className="text-sky/60" />
                  ) : (
                    <span className="text-sm font-bold text-sky">{req.name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold text-cloud">{req.name}</p>
                    {req.confidential && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-cloud/40 font-medium">Confidential</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${categoryColors[req.category] || 'bg-white/10 text-cloud/50'}`}>
                      {req.category}
                    </span>
                  </div>
                  <p className="text-sm text-cloud/60 line-clamp-2">{req.request}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-cloud/30">{req.date}</span>
                    {req.assignedTo && (
                      <span className="text-xs text-cloud/40">→ {req.assignedTo}</span>
                    )}
                  </div>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${statusColors[req.status] || 'bg-white/5 text-cloud/50 border-white/10'}`}>
                {req.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-cloud/30">
          <Icon name="HeartIcon" size={32} variant="outline" className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No prayer requests found</p>
        </div>
      )}

      {/* Add Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-cloud">New Prayer Request</h2>
              <button onClick={() => setShowAddModal(false)} className="text-cloud/40 hover:text-cloud">
                <Icon name="XMarkIcon" size={20} variant="outline" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Name (leave blank for anonymous)</label>
                <input type="text" placeholder="Full name" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Category</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud focus:outline-none focus:border-sky/50 transition-colors">
                  <option>Health</option>
                  <option>Family</option>
                  <option>Employment</option>
                  <option>Financial</option>
                  <option>Spiritual Growth</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Prayer Request</label>
                <textarea rows={4} placeholder="Describe the prayer request..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors resize-none" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="confidential" className="w-4 h-4 rounded border-white/20 bg-white/5" />
                <label htmlFor="confidential" className="text-sm text-cloud/60">Mark as confidential</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 bg-white/5 border border-white/10 text-cloud/70 text-sm font-semibold py-2.5 rounded-lg hover:bg-white/10 transition-colors">Cancel</button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 bg-sky text-slate-dark text-sm font-bold py-2.5 rounded-lg hover:bg-sky/90 transition-colors">Submit Request</button>
            </div>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${categoryColors[selectedRequest.category] || 'bg-white/10 text-cloud/50'}`}>
                  {selectedRequest.category}
                </span>
                {selectedRequest.confidential && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-cloud/40 font-medium">Confidential</span>
                )}
              </div>
              <button onClick={() => setSelectedRequest(null)} className="text-cloud/40 hover:text-cloud">
                <Icon name="XMarkIcon" size={20} variant="outline" />
              </button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-sky/10 flex items-center justify-center">
                {selectedRequest.anonymous ? (
                  <Icon name="EyeSlashIcon" size={18} variant="outline" className="text-sky/60" />
                ) : (
                  <span className="text-base font-bold text-sky">{selectedRequest.name.charAt(0)}</span>
                )}
              </div>
              <div>
                <p className="text-base font-bold text-cloud">{selectedRequest.name}</p>
                <p className="text-xs text-cloud/40">{selectedRequest.date}</p>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 mb-4">
              <p className="text-sm text-cloud/80 leading-relaxed">{selectedRequest.request}</p>
            </div>
            {selectedRequest.assignedTo && (
              <div className="flex items-center gap-2 mb-4 text-sm text-cloud/50">
                <Icon name="UserCircleIcon" size={14} variant="outline" />
                <span>Assigned to: <span className="text-cloud/70">{selectedRequest.assignedTo}</span></span>
              </div>
            )}
            <div className="mb-5">
              <p className="text-xs font-semibold text-cloud/40 mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {statuses.map((s) => (
                  <button
                    key={s}
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                      selectedRequest.status === s
                        ? statusColors[s]
                        : 'bg-white/5 text-cloud/40 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setSelectedRequest(null)} className="w-full bg-sky text-slate-dark text-sm font-bold py-2.5 rounded-lg hover:bg-sky/90 transition-colors">Close</button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
