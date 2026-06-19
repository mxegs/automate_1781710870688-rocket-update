'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';

interface SmallGroup {
  id: number;
  name: string;
  leader: string;
  members: number;
  meetingDay: string;
  meetingTime: string;
  location: string;
  type: string;
  status: 'Active' | 'Inactive';
  lastMeeting: string;
}

const groups: SmallGroup[] = [
  { id: 1, name: 'Northside Home Group', leader: 'James & Sarah Mokoena', members: 12, meetingDay: 'Tuesday', meetingTime: '19:00', location: '14 Oak Street, Northside', type: 'Home Group', status: 'Active', lastMeeting: '10 Jun' },
  { id: 2, name: 'Young Adults Discipleship', leader: 'Pastor Thabo Dlamini', members: 18, meetingDay: 'Thursday', meetingTime: '18:30', location: 'Church Hall B', type: 'Discipleship', status: 'Active', lastMeeting: '12 Jun' },
  { id: 3, name: 'Couples Connect', leader: 'David & Ruth Nkosi', members: 8, meetingDay: 'Friday', meetingTime: '19:30', location: '7 Maple Ave, Southside', type: 'Home Group', status: 'Active', lastMeeting: '13 Jun' },
  { id: 4, name: 'Seniors Fellowship', leader: 'Elder Samuel Khumalo', members: 14, meetingDay: 'Wednesday', meetingTime: '10:00', location: 'Church Lounge', type: 'Fellowship', status: 'Active', lastMeeting: '11 Jun' },
  { id: 5, name: 'New Believers Group', leader: 'Nomsa Zulu', members: 6, meetingDay: 'Sunday', meetingTime: '11:30', location: 'Room 3', type: 'Discipleship', status: 'Active', lastMeeting: '15 Jun' },
  { id: 6, name: 'Eastside Home Group', leader: 'Peter Sithole', members: 10, meetingDay: 'Monday', meetingTime: '19:00', location: '22 Pine Road, Eastside', type: 'Home Group', status: 'Inactive', lastMeeting: '1 May' },
];

const typeColors: Record<string, string> = {
  'Home Group': 'bg-sky/10 text-sky border-sky/20',
  'Discipleship': 'bg-purple-500/10 text-purple-400 border-purple-400/20',
  'Fellowship': 'bg-amber-500/10 text-amber-400 border-amber-400/20',
};

export default function SmallGroupsPage() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', leader: '', meetingDay: 'Monday', meetingTime: '', location: '', type: 'Home Group' });

  const filtered = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.leader.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = groups.filter((g) => g.status === 'Active').length;
  const totalMembers = groups.reduce((sum, g) => sum + g.members, 0);

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cloud tracking-tight">Small Groups</h1>
          <p className="text-cloud/40 text-sm mt-1">Home groups and discipleship groups</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-sky hover:bg-sky/90 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Icon name="PlusIcon" size={16} variant="outline" />
          New Group
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Groups', value: groups.length, icon: 'UserGroupIcon', color: 'sky' },
          { label: 'Active Groups', value: activeCount, icon: 'CheckCircleIcon', color: 'emerald' },
          { label: 'Total Members', value: totalMembers, icon: 'UsersIcon', color: 'purple' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
              stat.color === 'sky' ? 'bg-sky/10 text-sky' :
              stat.color === 'emerald'? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'
            }`}>
              <Icon name={stat.icon} size={16} variant="outline" />
            </div>
            <p className="text-2xl font-bold text-cloud font-mono">{stat.value}</p>
            <p className="text-xs text-cloud/40 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Icon name="MagnifyingGlassIcon" size={16} variant="outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-cloud/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search groups or leaders..."
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors"
        />
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((group) => (
          <div key={group.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-sky/30 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-cloud">{group.name}</h3>
                <p className="text-xs text-cloud/40 mt-0.5">{group.leader}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                group.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20' : 'bg-white/5 text-cloud/30 border-white/10'
              }`}>
                {group.status}
              </span>
            </div>

            <div className="space-y-1.5 mb-4">
              <div className="flex items-center gap-2 text-xs text-cloud/50">
                <Icon name="CalendarDaysIcon" size={12} variant="outline" className="text-cloud/30" />
                <span>{group.meetingDay}s at {group.meetingTime}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-cloud/50">
                <Icon name="MapPinIcon" size={12} variant="outline" className="text-cloud/30" />
                <span className="truncate">{group.location}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-cloud/50">
                <Icon name="UsersIcon" size={12} variant="outline" className="text-cloud/30" />
                <span>{group.members} members</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/8">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeColors[group.type] || 'bg-white/5 text-cloud/40 border-white/10'}`}>
                {group.type}
              </span>
              <span className="text-xs text-cloud/30">Last met: {group.lastMeeting}</span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Icon name="UserGroupIcon" size={40} variant="outline" className="text-cloud/20 mx-auto mb-3" />
          <p className="text-cloud/40 text-sm">No groups found</p>
        </div>
      )}

      {/* New Group Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-dark border border-white/15 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-cloud">Create New Group</h2>
              <button onClick={() => setShowModal(false)} className="text-cloud/40 hover:text-cloud">
                <Icon name="XMarkIcon" size={18} variant="outline" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Group Name', key: 'name', placeholder: 'e.g. Northside Home Group' },
                { label: 'Leader Name', key: 'leader', placeholder: 'e.g. James & Sarah Mokoena' },
                { label: 'Meeting Time', key: 'meetingTime', placeholder: 'e.g. 19:00' },
                { label: 'Location', key: 'location', placeholder: 'e.g. 14 Oak Street' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-cloud/50 mb-1">{field.label}</label>
                  <input
                    type="text"
                    value={newGroup[field.key as keyof typeof newGroup]}
                    onChange={(e) => setNewGroup({ ...newGroup, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-cloud/50 mb-1">Meeting Day</label>
                <select
                  value={newGroup.meetingDay}
                  onChange={(e) => setNewGroup({ ...newGroup, meetingDay: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-cloud focus:outline-none focus:border-sky/50 transition-colors"
                >
                  {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map((d) => (
                    <option key={d} value={d} className="bg-slate-dark">{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-cloud/50 mb-1">Group Type</label>
                <select
                  value={newGroup.type}
                  onChange={(e) => setNewGroup({ ...newGroup, type: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-cloud focus:outline-none focus:border-sky/50 transition-colors"
                >
                  {['Home Group','Discipleship','Fellowship'].map((t) => (
                    <option key={t} value={t} className="bg-slate-dark">{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-cloud/60 text-sm font-medium py-2.5 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={() => setShowModal(false)} className="flex-1 bg-sky hover:bg-sky/90 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
