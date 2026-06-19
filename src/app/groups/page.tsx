'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import PageHeader, { ContentCard } from '@/components/portal/PageHeader';
import {
  canManageGroups,
  createGroup,
  DEMO_MEMBER_OPTIONS,
  getAllGroups,
  updateGroup,
} from '@/lib/groups/service';
import { getCampusLabel, CAMPUSES, type CampusId } from '@/lib/church/constants';
import { getSession } from '@/lib/auth/session';
import type { ChurchGroup, GroupCategory } from '@/lib/groups/types';

export default function GroupsAdminPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<ChurchGroup[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ChurchGroup | null>(null);
  const [form, setForm] = useState({
    name: '',
    category: 'community' as GroupCategory,
    campus: 'midrand' as CampusId,
    description: '',
    leaderPhone: '',
    memberPhones: [] as string[],
    enableSongLibrary: false,
  });

  const refresh = () => setGroups(getAllGroups());

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

  const handleSave = () => {
    const leader = DEMO_MEMBER_OPTIONS.find((m) => m.phone === form.leaderPhone);
    if (!form.name.trim() || !leader) return;

    if (editing) {
      updateGroup(editing.id, {
        ...form,
        leaderName: leader.name,
      });
    } else {
      createGroup({
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
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#1E293B] p-6">
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
                  {DEMO_MEMBER_OPTIONS.map((m) => (
                    <option key={m.phone} value={m.phone}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold text-cloud/50">Assign members</label>
                <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg border border-white/10 p-2">
                  {DEMO_MEMBER_OPTIONS.filter((m) => m.phone !== form.leaderPhone).map((m) => (
                    <label key={m.phone} className="flex cursor-pointer items-center gap-2 text-xs text-cloud/70">
                      <input
                        type="checkbox"
                        checked={form.memberPhones.includes(m.phone)}
                        onChange={() => toggleMember(m.phone)}
                        className="accent-ckc-gold"
                      />
                      {m.name}
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
