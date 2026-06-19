'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';

interface CareRecord {
  id: number;
  memberName: string;
  type: string;
  description: string;
  assignedTo: string;
  status: string;
  date: string;
  scheduledDate?: string;
  notes?: string;
}

const mockCareRecords: CareRecord[] = [
  { id: 1, memberName: 'John Sithole', type: 'Hospital Visit', description: 'John was admitted to Baragwanath Hospital for surgery.', assignedTo: 'Pastor Dlamini', status: 'Scheduled', date: '14 Jun 2025', scheduledDate: '18 Jun 2025', notes: 'Ward 7, visiting hours 14:00-16:00' },
  { id: 2, memberName: 'Mary Khumalo', type: 'Counseling', description: 'Marriage counseling requested by Mary and her husband.', assignedTo: 'Pastor Dlamini', status: 'Open', date: '13 Jun 2025', scheduledDate: '20 Jun 2025' },
  { id: 3, memberName: 'David Nkosi', type: 'Home Visit', description: 'David has been absent for 3 weeks. Pastoral check-in needed.', assignedTo: 'Elder Mokoena', status: 'Completed', date: '10 Jun 2025', notes: 'Visited on 12 Jun. David is going through a difficult season at work.' },
  { id: 4, memberName: 'Grace Zulu', type: 'Follow-up', description: 'New member follow-up after joining the church last month.', assignedTo: 'Deacon Ndlovu', status: 'Completed', date: '5 Jun 2025' },
  { id: 5, memberName: 'Sipho Mthembu', type: 'Counseling', description: 'Grief counseling after loss of a family member.', assignedTo: 'Pastor Dlamini', status: 'In Progress', date: '15 Jun 2025', scheduledDate: '22 Jun 2025' },
  { id: 6, memberName: 'Nomsa Dlamini', type: 'Hospital Visit', description: 'Nomsa gave birth and is in Soweto Clinic.', assignedTo: 'Elder Mokoena', status: 'Open', date: '15 Jun 2025' },
];

const statusColors: Record<string, string> = {
  Open: 'bg-sky/10 text-sky border-sky/20',
  Scheduled: 'bg-amber-500/10 text-amber-400 border-amber-400/20',
  'In Progress': 'bg-purple-500/10 text-purple-400 border-purple-400/20',
  Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20',
  Closed: 'bg-white/5 text-cloud/40 border-white/10',
};

const typeColors: Record<string, string> = {
  'Hospital Visit': 'bg-rose-500/10 text-rose-400',
  'Counseling': 'bg-purple-500/10 text-purple-400',
  'Home Visit': 'bg-sky/10 text-sky',
  'Follow-up': 'bg-amber-500/10 text-amber-400',
};

const statuses = ['Open', 'Scheduled', 'In Progress', 'Completed', 'Closed'];

export default function PastoralCarePage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CareRecord | null>(null);

  const filtered = mockCareRecords.filter((r) => {
    const matchSearch = r.memberName.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase()) ||
      r.assignedTo.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = statuses.reduce((acc, s) => {
    acc[s] = mockCareRecords.filter((r) => r.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cloud tracking-tight">Pastoral Care</h1>
          <p className="text-cloud/40 text-sm mt-0.5">{mockCareRecords.filter((r) => r.status !== 'Closed' && r.status !== 'Completed').length} active care cases</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-sky text-slate-dark font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-sky/90 transition-colors"
        >
          <Icon name="PlusIcon" size={16} variant="outline" />
          New Care Record
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

      {/* Search */}
      <div className="relative mb-5">
        <Icon name="MagnifyingGlassIcon" size={16} variant="outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-cloud/30" />
        <input
          type="text"
          placeholder="Search care records..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-cloud placeholder-cloud/30 focus:outline-none focus:border-sky/50 transition-colors"
        />
      </div>

      {/* Records */}
      <div className="space-y-3">
        {filtered.map((record) => (
          <div
            key={record.id}
            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-sky/20 transition-colors cursor-pointer"
            onClick={() => setSelectedRecord(record)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full bg-sky/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-sky">{record.memberName.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold text-cloud">{record.memberName}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${typeColors[record.type] || 'bg-white/10 text-cloud/50'}`}>
                      {record.type}
                    </span>
                  </div>
                  <p className="text-sm text-cloud/60 line-clamp-1">{record.description}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-cloud/30">{record.date}</span>
                    <span className="text-xs text-cloud/40">→ {record.assignedTo}</span>
                    {record.scheduledDate && (
                      <span className="text-xs text-amber-400">Scheduled: {record.scheduledDate}</span>
                    )}
                  </div>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${statusColors[record.status] || 'bg-white/5 text-cloud/50 border-white/10'}`}>
                {record.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-cloud/30">
          <Icon name="HandRaisedIcon" size={32} variant="outline" className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No care records found</p>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-cloud">New Care Record</h2>
              <button onClick={() => setShowAddModal(false)} className="text-cloud/40 hover:text-cloud">
                <Icon name="XMarkIcon" size={20} variant="outline" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Member Name</label>
                <input type="text" placeholder="Search member..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Care Type</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud focus:outline-none focus:border-sky/50 transition-colors">
                    <option>Hospital Visit</option>
                    <option>Counseling</option>
                    <option>Home Visit</option>
                    <option>Follow-up</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Assigned To</label>
                  <input type="text" placeholder="Pastor / Elder" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Scheduled Date</label>
                <input type="date" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud focus:outline-none focus:border-sky/50 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Description</label>
                <textarea rows={3} placeholder="Describe the care need..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 bg-white/5 border border-white/10 text-cloud/70 text-sm font-semibold py-2.5 rounded-lg hover:bg-white/10 transition-colors">Cancel</button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 bg-sky text-slate-dark text-sm font-bold py-2.5 rounded-lg hover:bg-sky/90 transition-colors">Create Record</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${typeColors[selectedRecord.type] || 'bg-white/10 text-cloud/50'}`}>
                {selectedRecord.type}
              </span>
              <button onClick={() => setSelectedRecord(null)} className="text-cloud/40 hover:text-cloud">
                <Icon name="XMarkIcon" size={20} variant="outline" />
              </button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-sky/10 flex items-center justify-center">
                <span className="text-base font-bold text-sky">{selectedRecord.memberName.charAt(0)}</span>
              </div>
              <div>
                <p className="text-base font-bold text-cloud">{selectedRecord.memberName}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[selectedRecord.status]}`}>
                  {selectedRecord.status}
                </span>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 mb-4">
              <p className="text-sm text-cloud/70">{selectedRecord.description}</p>
            </div>
            <div className="space-y-2.5 mb-4">
              {[
                { label: 'Assigned', value: selectedRecord.assignedTo, icon: 'UserCircleIcon' },
                { label: 'Opened', value: selectedRecord.date, icon: 'CalendarDaysIcon' },
                { label: 'Scheduled', value: selectedRecord.scheduledDate || 'Not scheduled', icon: 'ClockIcon' },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <Icon name={row.icon} size={14} variant="outline" className="text-cloud/30 flex-shrink-0" />
                  <span className="text-xs text-cloud/40 w-16">{row.label}</span>
                  <span className="text-sm text-cloud">{row.value}</span>
                </div>
              ))}
            </div>
            {selectedRecord.notes && (
              <div className="bg-white/5 rounded-lg p-3 mb-4">
                <p className="text-xs text-cloud/40 mb-1">Care Notes</p>
                <p className="text-sm text-cloud/70">{selectedRecord.notes}</p>
              </div>
            )}
            <div className="mb-4">
              <p className="text-xs font-semibold text-cloud/40 mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {statuses.map((s) => (
                  <button key={s} className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${selectedRecord.status === s ? statusColors[s] : 'bg-white/5 text-cloud/40 border-white/10 hover:border-white/20'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setSelectedRecord(null)} className="w-full bg-sky text-slate-dark text-sm font-bold py-2.5 rounded-lg hover:bg-sky/90 transition-colors">Close</button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
