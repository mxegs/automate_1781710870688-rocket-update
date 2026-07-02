'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import PageHeader, { ContentCard } from '@/components/portal/PageHeader';
import {
  canManageGroups,
  createGroup,
  getAllGroups,
  getMemberOptions,
  updateGroup,
  type MemberOption,
} from '@/lib/groups/service';
import { getCampusLabel, CAMPUSES, AGE_CATEGORIES, type CampusId } from '@/lib/church/constants';
import { getSession } from '@/lib/auth/session';
import type { ChurchGroup, GroupCategory } from '@/lib/groups/types';

export default function GroupsAdminPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<ChurchGroup[]>([]);
  const [memberOptions, setMemberOptions] = useState<MemberOption[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ChurchGroup | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberCampusFilter, setMemberCampusFilter] = useState<CampusId | 'all'>('all');
  const [memberGenderFilter, setMemberGenderFilter] = useState<'all' | 'Male' | 'Female'>('all');
  const [memberAgeFilter, setMemberAgeFilter] = useState<'all' | 'child' | 'youth' | 'adult'>('all');
  const [form, setForm] = useState({
    name: '',
    category: 'community' as GroupCategory,
    campus: 'midrand' as CampusId,
    description: '',
    leaderPhone: '',
    memberPhones: [] as string[],
    enableSongLibrary: false,
  });

  const refresh = async () => {
    setGroups(await getAllGroups());
    setMemberOptions(await getMemberOptions());
  };

  useEffect(() => {
    const session = getSession();
    if (!session || !canManageGroups(session.role)) {
      router.replace('/dashboard');
      return;
    }
    refresh();
  }, [router]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: '',
      category: 'community',
      campus: 'midrand',
      description: '',
      leaderPhone: '',
      memberPhones: [],
      enableSongLibrary: false,
    });
    setShowModal(true);
  };

  const openEdit = (g: ChurchGroup) => {
    setEditing(g);
    setForm({
      name: g.name,
      category: g.category,
      campus: g.campus,
      description: g.description ?? '',
      leaderPhone: g.leaderPhone,
      memberPhones: [...g.memberPhones],
      enableSongLibrary: g.enableSongLibrary,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const leader = memberOptions.find((m) => m.phone === form.leaderPhone);
    if (!form.name.trim() || !leader) return;

    if (editing) {
      await updateGroup(editing.id, {
        ...form,
        leaderName: leader.name,
      });
    } else {
      await createGroup({
        ...form,
        leaderName: leader.name,
      });
    }
    setShowModal(false);
    refresh();
  };

  const toggleMember = (phone: string) => {
    setForm((f) => ({
      ...f,
      memberPhones: f.memberPhones.includes(phone)
        ? f.memberPhones.filter((p) => p !== phone)
        : [...f.memberPhones, phone],
    }));
  };

  const ageToCategory = (age: number | null): 'child' | 'youth' | 'adult' => {
    if (age == null) return 'adult';
    if (age <= 12) return 'child';
    if (age <= 25) return 'youth';
    return 'adult';
  };

  const filteredMembers = memberOptions.filter((m) => {
    if (m.phone === form.leaderPhone) return false;
    const matchSearch =
      !memberSearch || m.name.toLowerCase().includes(memberSearch.toLowerCase());
    const matchCampus = memberCampusFilter === 'all' || m.campus === memberCampusFilter;
    const matchGender = memberGenderFilter === 'all' || m.gender === memberGenderFilter;
    const matchAge =
      memberAgeFilter === 'all' || ageToCategory(m.age) === memberAgeFilter;
    return matchSearch && matchCampus && matchGender && matchAge;
  });

  const selectAllFiltered = () => {
    const phones = filteredMembers.map((m) => m.phone);
    setForm((f) => ({
      ...f,
      memberPhones: [...new Set([...f.memberPhones, ...phones])],
    }));
  };

  const clearAllMembers = () => {
    setForm((f) => ({ ...f, memberPhones: [] }));
  };

  return (
    <AppShell access="staff">
      <PageHeader
        title="Groups"
        subtitle="Create groups & ministries, assign leaders and members"
        actions={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-ckc-gold px-4 py-2.5 text-sm font-bold text-ckc-black hover:bg-ckc-gold-light"
          >
            <Icon name="PlusIcon" size={16} variant="outline" />
            Create Group
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {groups.map((g) => (
          <ContentCard key={g.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-ckc-gold">
                  {g.category === 'ministry' ? 'Ministry' : 'Group'} · {getCampusLabel(g.campus)}
                </span>
                <h3 className="mt-1 text-base font-bold text-cloud">{g.name}</h3>
                {g.description && <p className="mt-1 text-xs text-cloud/40">{g.description}</p>}
              </div>
              {g.enableSongLibrary && (
                <span className="shrink-0 rounded border border-ckc-gold/30 bg-ckc-gold/10 px-2 py-0.5 text-[10px] text-ckc-gold">
                  Songs
                </span>
              )}
            </div>
            <div className="mt-4 space-y-1 text-xs text-cloud/50">
              <p>
                <span className="text-cloud/30">Leader:</span> {g.leaderName}
              </p>
              <p>
                <span className="text-cloud/30">Members:</span> {g.memberPhones.length} assigned
              </p>
            </div>
            <button
              onClick={() => openEdit(g)}
              className="mt-4 w-full rounded-lg border border-white/10 py-2 text-xs font-semibold text-cloud/60 hover:border-ckc-gold/30 hover:text-ckc-gold"
            >
              Edit group
            </button>
          </ContentCard>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-ckc-card p-6">
            <h2 className="mb-4 text-lg font-bold text-cloud">{editing ? 'Edit Group' : 'Create Group'}</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-cloud/50">Group name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Women's Ministry, Worship Team…"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-cloud"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-cloud/50">Type</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as GroupCategory })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-cloud"
                  >
                    <option value="ministry">Ministry</option>
                    <option value="community">Community group</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-cloud/50">Campus</label>
                  <select
                    value={form.campus}
                    onChange={(e) => setForm({ ...form, campus: e.target.value as CampusId })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-cloud"
                  >
                    {CAMPUSES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-cloud/50">Group leader</label>
                <select
                  value={form.leaderPhone}
                  onChange={(e) => setForm({ ...form, leaderPhone: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-cloud"
                >
                  <option value="">Select leader</option>
                  {memberOptions.map((m) => (
                    <option key={m.phone} value={m.phone}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-xs font-semibold text-cloud/50">Assign members</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={selectAllFiltered} className="text-[10px] text-ckc-gold font-semibold">Select all</button>
                    <button type="button" onClick={clearAllMembers} className="text-[10px] text-cloud/40">Clear</button>
                  </div>
                </div>
                <input
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search members…"
                  className="mb-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-cloud"
                />
                <div className="mb-2 flex flex-wrap gap-1">
                  <span className="mr-1 text-[10px] uppercase text-cloud/30">Campus</span>
                  {(['all', ...CAMPUSES.map((c) => c.id)] as const).map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setMemberCampusFilter(id)}
                      className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${
                        memberCampusFilter === id
                          ? 'border-ckc-gold/30 bg-ckc-gold/10 text-ckc-gold'
                          : 'border-white/10 text-cloud/50'
                      }`}
                    >
                      {id === 'all' ? 'All' : getCampusLabel(id)}
                    </button>
                  ))}
                </div>
                <div className="mb-2 flex flex-wrap gap-1">
                  <span className="mr-1 text-[10px] uppercase text-cloud/30">Gender</span>
                  {(['all', 'Male', 'Female'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setMemberGenderFilter(g)}
                      className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${
                        memberGenderFilter === g
                          ? 'border-ckc-gold/30 bg-ckc-gold/10 text-ckc-gold'
                          : 'border-white/10 text-cloud/50'
                      }`}
                    >
                      {g === 'all' ? 'All' : g}
                    </button>
                  ))}
                </div>
                <div className="mb-2 flex flex-wrap gap-1">
                  <span className="mr-1 text-[10px] uppercase text-cloud/30">Age</span>
                  {(['all', 'child', 'youth', 'adult'] as const).map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setMemberAgeFilter(id)}
                      className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${
                        memberAgeFilter === id
                          ? 'border-ckc-gold/30 bg-ckc-gold/10 text-ckc-gold'
                          : 'border-white/10 text-cloud/50'
                      }`}
                    >
                      {id === 'all' ? 'All' : AGE_CATEGORIES.find((a) => a.id === id)?.label}
                    </button>
                  ))}
                </div>
                <p className="mb-1 text-[10px] text-cloud/30">
                  {filteredMembers.length} member{filteredMembers.length === 1 ? '' : 's'} match filters (active only)
                </p>
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-white/10 p-2">
                  {filteredMembers.map((m) => (
                    <label key={m.phone} className="flex cursor-pointer items-center gap-2 text-xs text-cloud/70">
                      <input
                        type="checkbox"
                        checked={form.memberPhones.includes(m.phone)}
                        onChange={() => toggleMember(m.phone)}
                        className="accent-ckc-gold"
                      />
                      {m.name}
                      <span className="text-cloud/30">
                        {' '}
                        · {getCampusLabel(m.campus as CampusId)}
                        {m.gender ? ` · ${m.gender}` : ''}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              {form.category === 'ministry' && (
                <label className="flex items-center gap-2 text-xs text-cloud/60">
                  <input
                    type="checkbox"
                    checked={form.enableSongLibrary}
                    onChange={(e) => setForm({ ...form, enableSongLibrary: e.target.checked })}
                    className="accent-ckc-gold"
                  />
                  Enable song library (for worship / band)
                </label>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm text-cloud/60">
                Cancel
              </button>
              <button onClick={handleSave} className="flex-1 rounded-lg bg-ckc-gold py-2.5 text-sm font-bold text-ckc-black">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
