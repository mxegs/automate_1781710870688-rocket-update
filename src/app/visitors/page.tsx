'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';

interface Visitor {
  id: number;
  name: string;
  phone: string;
  email: string;
  firstVisit: string;
  source: string;
  status: string;
  notes: string;
  followUpDate?: string;
}

const mockVisitors: Visitor[] = [
  { id: 1, name: 'Thabo Mokoena', phone: '071 234 5678', email: 'thabo@email.com', firstVisit: '15 Jun 2025', source: 'Friend', status: 'New Visitor', notes: 'Came with the Dlamini family', followUpDate: '18 Jun 2025' },
  { id: 2, name: 'Lerato Dlamini', phone: '082 345 6789', email: 'lerato@email.com', firstVisit: '15 Jun 2025', source: 'Social Media', status: 'Contacted', notes: 'Interested in youth group', followUpDate: '20 Jun 2025' },
  { id: 3, name: 'Sipho Nkosi', phone: '073 456 7890', email: '', firstVisit: '8 Jun 2025', source: 'Walk-in', status: 'Follow-Up Scheduled', notes: 'Moved to the area recently', followUpDate: '22 Jun 2025' },
  { id: 4, name: 'Nomsa Zulu', phone: '064 567 8901', email: 'nomsa@email.com', firstVisit: '8 Jun 2025', source: 'Family', status: 'Attending Regularly', notes: 'Daughter of church member', },
  { id: 5, name: 'Bongani Mthembu', phone: '079 678 9012', email: '', firstVisit: '1 Jun 2025', source: 'Walk-in', status: 'Membership Candidate', notes: 'Ready to join membership class' },
  { id: 6, name: 'Zanele Ndlovu', phone: '061 901 2345', email: 'zanele@email.com', firstVisit: '25 May 2025', source: 'Friend', status: 'Became Member', notes: 'Joined membership on 10 Jun' },
];

const statusColors: Record<string, string> = {
  'New Visitor': 'bg-sky/10 text-sky border-sky/20',
  'Contacted': 'bg-amber-500/10 text-amber-400 border-amber-400/20',
  'Follow-Up Scheduled': 'bg-purple-500/10 text-purple-400 border-purple-400/20',
  'Attending Regularly': 'bg-blue-500/10 text-blue-400 border-blue-400/20',
  'Membership Candidate': 'bg-orange-500/10 text-orange-400 border-orange-400/20',
  'Became Member': 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20',
};

const statusOrder = ['New Visitor', 'Contacted', 'Follow-Up Scheduled', 'Attending Regularly', 'Membership Candidate', 'Became Member'];

export default function VisitorsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

  const filtered = mockVisitors.filter((v) => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.source.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = statusOrder.reduce((acc, s) => {
    acc[s] = mockVisitors.filter((v) => v.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AppShell access="staff">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cloud tracking-tight">Visitor Tracking</h1>
          <p className="text-cloud/40 text-sm mt-0.5">{mockVisitors.length} visitors tracked</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-sky text-slate-dark font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-sky/90 transition-colors"
        >
          <Icon name="PlusIcon" size={16} variant="outline" />
          Register Visitor
        </button>
      </div>

      {/* Pipeline summary */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
        {statusOrder.map((s, i) => (
          <button
            key={s}
            onClick={() => setStatusFilter(statusFilter === s ? 'All' : s)}
            className={`p-3 rounded-lg border text-left transition-all ${
              statusFilter === s
                ? 'border-sky/40 bg-sky/5' :'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <p className="text-lg font-bold text-cloud font-mono">{counts[s] || 0}</p>
            <p className="text-xs text-cloud/40 leading-tight mt-0.5">{s}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Icon name="MagnifyingGlassIcon" size={16} variant="outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-cloud/30" />
        <input
          type="text"
          placeholder="Search visitors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-cloud placeholder-cloud/30 focus:outline-none focus:border-sky/50 transition-colors"
        />
      </div>

      {/* Visitor cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((visitor) => (
          <div
            key={visitor.id}
            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-sky/20 transition-colors cursor-pointer"
            onClick={() => setSelectedVisitor(visitor)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-sky/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-sky">{visitor.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-cloud">{visitor.name}</p>
                  <p className="text-xs text-cloud/40">via {visitor.source}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${statusColors[visitor.status] || 'bg-white/5 text-cloud/50 border-white/10'}`}>
                {visitor.status}
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-cloud/50">
                <Icon name="CalendarDaysIcon" size={12} variant="outline" />
                <span>First visit: {visitor.firstVisit}</span>
              </div>
              {visitor.phone && (
                <div className="flex items-center gap-2 text-xs text-cloud/50">
                  <Icon name="PhoneIcon" size={12} variant="outline" />
                  <span>{visitor.phone}</span>
                </div>
              )}
              {visitor.followUpDate && (
                <div className="flex items-center gap-2 text-xs text-amber-400">
                  <Icon name="ClockIcon" size={12} variant="outline" />
                  <span>Follow-up: {visitor.followUpDate}</span>
                </div>
              )}
            </div>
            {visitor.notes && (
              <p className="text-xs text-cloud/30 mt-3 pt-3 border-t border-white/5 line-clamp-1">{visitor.notes}</p>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-cloud/30">
          <Icon name="UserPlusIcon" size={32} variant="outline" className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No visitors found</p>
        </div>
      )}

      {/* Add Visitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-cloud">Register Visitor</h2>
              <button onClick={() => setShowAddModal(false)} className="text-cloud/40 hover:text-cloud">
                <Icon name="XMarkIcon" size={20} variant="outline" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Full Name', placeholder: 'John Doe', col: 2 },
                { label: 'Phone', placeholder: '071 000 0000', col: 1 },
                { label: 'Email', placeholder: 'john@email.com', col: 1 },
              ].map((field) => (
                <div key={field.label} className={field.col === 2 ? 'col-span-2' : 'col-span-1'}>
                  <label className="block text-xs font-semibold text-cloud/50 mb-1.5">{field.label}</label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">How did they hear about us?</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud focus:outline-none focus:border-sky/50 transition-colors">
                  <option>Friend</option>
                  <option>Family</option>
                  <option>Social Media</option>
                  <option>Walk-in</option>
                  <option>Online Search</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Date of First Visit</label>
                <input
                  type="date"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud focus:outline-none focus:border-sky/50 transition-colors"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Notes</label>
                <textarea
                  rows={3}
                  placeholder="Any notes about this visitor..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors resize-none"
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
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-sky text-slate-dark text-sm font-bold py-2.5 rounded-lg hover:bg-sky/90 transition-colors"
              >
                Register Visitor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visitor Detail Modal */}
      {selectedVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-cloud">Visitor Details</h2>
              <button onClick={() => setSelectedVisitor(null)} className="text-cloud/40 hover:text-cloud">
                <Icon name="XMarkIcon" size={20} variant="outline" />
              </button>
            </div>
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-white/10">
              <div className="w-12 h-12 rounded-full bg-sky/10 flex items-center justify-center">
                <span className="text-lg font-bold text-sky">{selectedVisitor.name.charAt(0)}</span>
              </div>
              <div>
                <p className="text-base font-bold text-cloud">{selectedVisitor.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[selectedVisitor.status]}`}>
                  {selectedVisitor.status}
                </span>
              </div>
            </div>
            <div className="space-y-3 mb-5">
              {[
                { label: 'Phone', value: selectedVisitor.phone || '—', icon: 'PhoneIcon' },
                { label: 'Email', value: selectedVisitor.email || '—', icon: 'EnvelopeIcon' },
                { label: 'First Visit', value: selectedVisitor.firstVisit, icon: 'CalendarDaysIcon' },
                { label: 'Source', value: selectedVisitor.source, icon: 'LinkIcon' },
                { label: 'Follow-up', value: selectedVisitor.followUpDate || 'Not scheduled', icon: 'ClockIcon' },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <Icon name={row.icon} size={14} variant="outline" className="text-cloud/30 flex-shrink-0" />
                  <span className="text-xs text-cloud/40 w-16">{row.label}</span>
                  <span className="text-sm text-cloud">{row.value}</span>
                </div>
              ))}
            </div>
            {selectedVisitor.notes && (
              <div className="bg-white/5 rounded-lg p-3 mb-5">
                <p className="text-xs text-cloud/40 mb-1">Notes</p>
                <p className="text-sm text-cloud/70">{selectedVisitor.notes}</p>
              </div>
            )}
            <div className="mb-4">
              <p className="text-xs font-semibold text-cloud/40 mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {statusOrder.map((s) => (
                  <button
                    key={s}
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                      selectedVisitor.status === s
                        ? statusColors[s]
                        : 'bg-white/5 text-cloud/40 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setSelectedVisitor(null)}
              className="w-full bg-sky text-slate-dark text-sm font-bold py-2.5 rounded-lg hover:bg-sky/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
