'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';

interface Ministry {
  id: number;
  name: string;
  leader: string;
  members: number;
  meetingDay: string;
  meetingTime: string;
  description: string;
  icon: string;
  color: string;
}

const mockMinistries: Ministry[] = [];

const colorMap: Record<string, string> = {
  sky: 'bg-ckc-gold/10 text-ckc-gold border-ckc-gold/20',
  purple: 'bg-ckc-gold/10 text-ckc-gold border-ckc-gold/20',
  amber: 'bg-ckc-gold/10 text-ckc-gold border-ckc-gold/20',
  rose: 'bg-ckc-gold/10 text-ckc-muted border-ckc-gold/20',
  pink: 'bg-ckc-gold/10 text-ckc-gold border-ckc-gold/20',
  emerald: 'bg-ckc-gold/10 text-ckc-gold border-ckc-gold/20',
};

const iconBg: Record<string, string> = {
  sky: 'bg-ckc-gold/10 text-ckc-gold',
  purple: 'bg-ckc-gold/10 text-ckc-gold',
  amber: 'bg-ckc-gold/10 text-ckc-gold',
  rose: 'bg-rose-500/10 text-rose-400',
  pink: 'bg-ckc-gold/10 text-ckc-gold',
  emerald: 'bg-ckc-gold/10 text-ckc-gold',
};

export default function MinistriesPage() {
  const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <AppShell access="staff">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cloud tracking-tight">Ministries</h1>
          <p className="text-cloud/40 text-sm mt-0.5">{mockMinistries.length} active ministries</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-ckc-gold text-ckc-black font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-ckc-gold/90 transition-colors"
        >
          <Icon name="PlusIcon" size={16} variant="outline" />
          Add Ministry
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-2xl font-bold text-cloud font-mono">{mockMinistries.length}</p>
          <p className="text-xs text-cloud/40 mt-0.5">Total Ministries</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-2xl font-bold text-cloud font-mono">{mockMinistries.reduce((a, m) => a + m.members, 0)}</p>
          <p className="text-xs text-cloud/40 mt-0.5">Total Volunteers</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-2xl font-bold text-cloud font-mono">{mockMinistries.length}</p>
          <p className="text-xs text-cloud/40 mt-0.5">Ministry Leaders</p>
        </div>
      </div>

      {/* Ministry cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockMinistries.map((ministry) => (
          <div
            key={ministry.id}
            className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-ckc-gold/20 transition-colors cursor-pointer"
            onClick={() => setSelectedMinistry(ministry)}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg[ministry.color]}`}>
                <Icon name={ministry.icon} size={20} variant="outline" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-cloud">{ministry.name}</h3>
                <p className="text-xs text-cloud/40">Led by {ministry.leader}</p>
              </div>
            </div>
            <p className="text-sm text-cloud/60 mb-4 line-clamp-2">{ministry.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-cloud/50">
                <Icon name="UsersIcon" size={12} variant="outline" />
                <span>{ministry.members} members</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-cloud/50">
                <Icon name="CalendarDaysIcon" size={12} variant="outline" />
                <span>{ministry.meetingDay} {ministry.meetingTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ministry Detail Modal */}
      {selectedMinistry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-ckc-card border border-white/10 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg[selectedMinistry.color]}`}>
                <Icon name={selectedMinistry.icon} size={20} variant="outline" />
              </div>
              <button onClick={() => setSelectedMinistry(null)} className="text-cloud/40 hover:text-cloud">
                <Icon name="XMarkIcon" size={20} variant="outline" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-cloud mb-1">{selectedMinistry.name}</h2>
            <p className="text-sm text-cloud/50 mb-5">{selectedMinistry.description}</p>
            <div className="space-y-3 mb-5">
              {[
                { label: 'Leader', value: selectedMinistry.leader, icon: 'UserCircleIcon' },
                { label: 'Members', value: `${selectedMinistry.members} volunteers`, icon: 'UsersIcon' },
                { label: 'Meets', value: `${selectedMinistry.meetingDay} at ${selectedMinistry.meetingTime}`, icon: 'CalendarDaysIcon' },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <Icon name={row.icon} size={14} variant="outline" className="text-cloud/30 flex-shrink-0" />
                  <span className="text-xs text-cloud/40 w-16">{row.label}</span>
                  <span className="text-sm text-cloud">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-cloud/70 text-sm font-semibold py-2.5 rounded-lg hover:bg-white/10 transition-colors">
                <Icon name="EnvelopeIcon" size={14} variant="outline" />
                Message Team
              </button>
              <button onClick={() => setSelectedMinistry(null)} className="flex-1 bg-ckc-gold text-ckc-black text-sm font-bold py-2.5 rounded-lg hover:bg-ckc-gold/90 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Ministry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-ckc-card border border-white/10 rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-cloud">Add Ministry</h2>
              <button onClick={() => setShowAddModal(false)} className="text-cloud/40 hover:text-cloud">
                <Icon name="XMarkIcon" size={20} variant="outline" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Ministry Name', placeholder: 'e.g. Worship Team' },
                { label: 'Ministry Leader', placeholder: 'Leader name' },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-xs font-semibold text-cloud/50 mb-1.5">{field.label}</label>
                  <input type="text" placeholder={field.placeholder} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-ckc-gold/50 transition-colors" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Meeting Day</label>
                  <input type="text" placeholder="e.g. Friday" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-ckc-gold/50 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Meeting Time</label>
                  <input type="time" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud focus:outline-none focus:border-ckc-gold/50 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Description</label>
                <textarea rows={3} placeholder="Ministry description..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-ckc-gold/50 transition-colors resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 bg-white/5 border border-white/10 text-cloud/70 text-sm font-semibold py-2.5 rounded-lg hover:bg-white/10 transition-colors">Cancel</button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 bg-ckc-gold text-ckc-black text-sm font-bold py-2.5 rounded-lg hover:bg-ckc-gold/90 transition-colors">Add Ministry</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
