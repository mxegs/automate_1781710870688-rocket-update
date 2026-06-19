'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';

interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive' | 'New';
  ministry: string;
  joinDate: string;
  gender: 'Male' | 'Female';
  baptised: boolean;
}

const mockMembers: Member[] = [
  { id: 1, name: 'Thabo Mokoena', email: 'thabo@email.com', phone: '071 234 5678', status: 'Active', ministry: 'Worship Team', joinDate: '12 Jan 2022', gender: 'Male', baptised: true },
  { id: 2, name: 'Lerato Dlamini', email: 'lerato@email.com', phone: '082 345 6789', status: 'Active', ministry: 'Youth Ministry', joinDate: '5 Mar 2021', gender: 'Female', baptised: true },
  { id: 3, name: 'Sipho Nkosi', email: 'sipho@email.com', phone: '073 456 7890', status: 'Active', ministry: 'Media Team', joinDate: '20 Jun 2023', gender: 'Male', baptised: false },
  { id: 4, name: 'Nomsa Zulu', email: 'nomsa@email.com', phone: '064 567 8901', status: 'Active', ministry: "Women's Ministry", joinDate: '8 Aug 2020', gender: 'Female', baptised: true },
  { id: 5, name: 'David Sithole', email: 'david@email.com', phone: '079 678 9012', status: 'Inactive', ministry: 'Outreach Team', joinDate: '15 Feb 2019', gender: 'Male', baptised: true },
  { id: 6, name: 'Grace Khumalo', email: 'grace@email.com', phone: '083 789 0123', status: 'Active', ministry: 'Hospitality', joinDate: '3 Nov 2022', gender: 'Female', baptised: true },
  { id: 7, name: 'Bongani Mthembu', email: 'bongani@email.com', phone: '076 890 1234', status: 'New', ministry: 'None', joinDate: '1 Jun 2024', gender: 'Male', baptised: false },
  { id: 8, name: 'Zanele Ndlovu', email: 'zanele@email.com', phone: '061 901 2345', status: 'Active', ministry: "Children's Ministry", joinDate: '22 Apr 2021', gender: 'Female', baptised: true },
];

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20',
  Inactive: 'bg-white/5 text-cloud/40 border-white/10',
  New: 'bg-sky/10 text-sky border-sky/20',
};

export default function MembersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const filtered = mockMembers.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.ministry.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cloud tracking-tight">Members</h1>
          <p className="text-cloud/40 text-sm mt-0.5">{mockMembers.length} total members</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-sky text-slate-dark font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-sky/90 transition-colors"
        >
          <Icon name="PlusIcon" size={16} variant="outline" />
          Add Member
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Icon name="MagnifyingGlassIcon" size={16} variant="outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-cloud/30" />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-cloud placeholder-cloud/30 focus:outline-none focus:border-sky/50 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Active', 'Inactive', 'New'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                statusFilter === s
                  ? 'bg-sky/10 text-sky border-sky/30' :'bg-white/5 text-cloud/50 border-white/10 hover:text-cloud hover:border-white/20'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs font-semibold text-cloud/40 uppercase tracking-wider px-5 py-3">Member</th>
                <th className="text-left text-xs font-semibold text-cloud/40 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Ministry</th>
                <th className="text-left text-xs font-semibold text-cloud/40 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Joined</th>
                <th className="text-left text-xs font-semibold text-cloud/40 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-cloud/40 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Baptised</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => (
                <tr key={member.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sky/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-sky">{member.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-cloud">{member.name}</p>
                        <p className="text-xs text-cloud/40">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-sm text-cloud/60">{member.ministry}</span>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className="text-sm text-cloud/50">{member.joinDate}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[member.status]}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    {member.baptised ? (
                      <Icon name="CheckCircleIcon" size={16} variant="outline" className="text-emerald-400" />
                    ) : (
                      <Icon name="MinusCircleIcon" size={16} variant="outline" className="text-cloud/20" />
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setSelectedMember(member)}
                      className="text-cloud/30 hover:text-sky transition-colors"
                    >
                      <Icon name="EllipsisHorizontalIcon" size={18} variant="outline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-cloud/30">
            <Icon name="UsersIcon" size={32} variant="outline" className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No members found</p>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-cloud">Add New Member</h2>
              <button onClick={() => setShowAddModal(false)} className="text-cloud/40 hover:text-cloud">
                <Icon name="XMarkIcon" size={20} variant="outline" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Full Name', placeholder: 'John Doe', col: 2 },
                { label: 'Email', placeholder: 'john@email.com', col: 1 },
                { label: 'Phone', placeholder: '071 000 0000', col: 1 },
                { label: 'Date of Birth', placeholder: 'DD/MM/YYYY', col: 1 },
                { label: 'Address', placeholder: '123 Church Street', col: 1 },
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
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Gender</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud focus:outline-none focus:border-sky/50 transition-colors">
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Ministry</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud focus:outline-none focus:border-sky/50 transition-colors">
                  <option>None</option>
                  <option>Worship Team</option>
                  <option>Youth Ministry</option>
                  <option>Media Team</option>
                  <option>Hospitality</option>
                  <option>Outreach Team</option>
                </select>
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
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-cloud">Member Profile</h2>
              <button onClick={() => setSelectedMember(null)} className="text-cloud/40 hover:text-cloud">
                <Icon name="XMarkIcon" size={20} variant="outline" />
              </button>
            </div>
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-white/10">
              <div className="w-14 h-14 rounded-full bg-sky/10 flex items-center justify-center">
                <span className="text-xl font-bold text-sky">{selectedMember.name.charAt(0)}</span>
              </div>
              <div>
                <p className="text-lg font-bold text-cloud">{selectedMember.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[selectedMember.status]}`}>
                  {selectedMember.status}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Email', value: selectedMember.email, icon: 'EnvelopeIcon' },
                { label: 'Phone', value: selectedMember.phone, icon: 'PhoneIcon' },
                { label: 'Ministry', value: selectedMember.ministry, icon: 'BuildingLibraryIcon' },
                { label: 'Joined', value: selectedMember.joinDate, icon: 'CalendarDaysIcon' },
                { label: 'Baptised', value: selectedMember.baptised ? 'Yes' : 'No', icon: 'CheckCircleIcon' },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <Icon name={row.icon} size={15} variant="outline" className="text-cloud/30 flex-shrink-0" />
                  <span className="text-xs text-cloud/40 w-16">{row.label}</span>
                  <span className="text-sm text-cloud">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-cloud/70 text-sm font-semibold py-2.5 rounded-lg hover:bg-white/10 transition-colors">
                <Icon name="PencilIcon" size={14} variant="outline" />
                Edit
              </button>
              <button
                onClick={() => setSelectedMember(null)}
                className="flex-1 bg-sky text-slate-dark text-sm font-bold py-2.5 rounded-lg hover:bg-sky/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
