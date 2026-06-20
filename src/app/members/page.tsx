'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import PageHeader, { ContentCard } from '@/components/portal/PageHeader';
import SendInvitePanel, { type SendInvitePrefill } from '@/components/admin/SendInvitePanel';
import InviteRequestsPanel from '@/components/admin/InviteRequestsPanel';
import PendingApplicationsPanel from '@/components/admin/PendingApplicationsPanel';
import { AGE_CATEGORIES, CAMPUSES, getCampusLabel, type CampusId } from '@/lib/church/constants';
import type { InviteRequest } from '@/lib/invites/request-service';
import { apiFetch, useBackend } from '@/lib/api/client';
import { formatPhoneDisplay } from '@/lib/auth/session';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive' | 'New';
  ministry: string;
  joinDate: string;
  gender: 'Male' | 'Female' | 'Unknown';
  ageCategory: 'child' | 'youth' | 'adult';
  campus: CampusId;
  baptised: boolean;
}

function ageToCategory(age: number | null | undefined): 'child' | 'youth' | 'adult' {
  if (age == null) return 'adult';
  if (age <= 12) return 'child';
  if (age <= 25) return 'youth';
  return 'adult';
}

function mapDbMember(row: {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  campus_id: string;
  gender: string | null;
  age: number | null;
  status: string;
  member_since: string;
}): Member {
  const statusMap: Record<string, Member['status']> = {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'New',
  };
  return {
    id: row.id,
    name: row.full_name,
    email: row.email ?? '',
    phone: formatPhoneDisplay(row.phone),
    status: statusMap[row.status] ?? 'Active',
    ministry: '—',
    joinDate: row.member_since,
    gender: row.gender === 'Male' || row.gender === 'Female' ? row.gender : 'Unknown',
    ageCategory: ageToCategory(row.age),
    campus: row.campus_id as CampusId,
    baptised: false,
  };
}

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20',
  Inactive: 'bg-white/5 text-cloud/40 border-white/10',
  New: 'bg-sky/10 text-sky border-sky/20',
};

type Tab = 'members' | 'requests' | 'applications';

export default function MembersPage() {
  const backend = useBackend();
  const [tab, setTab] = useState<Tab>('requests');
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [campusFilter, setCampusFilter] = useState('All');
  const [ageFilter, setAgeFilter] = useState('All');
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [invitePrefill, setInvitePrefill] = useState<SendInvitePrefill>();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [requestsKey, setRequestsKey] = useState(0);

  useEffect(() => {
    if (!backend || tab !== 'members') return;
    setMembersLoading(true);
    apiFetch<
      {
        id: string;
        full_name: string;
        email: string | null;
        phone: string;
        campus_id: string;
        gender: string | null;
        age: number | null;
        status: string;
        member_since: string;
      }[]
    >('/api/members')
      .then((rows) => setMembers(rows.map(mapDbMember)))
      .catch(() => setMembers([]))
      .finally(() => setMembersLoading(false));
  }, [backend, tab, requestsKey]);

  const filtered = members.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.ministry.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || m.status === statusFilter;
    const matchGender = genderFilter === 'All' || m.gender === genderFilter;
    const matchCampus = campusFilter === 'All' || m.campus === campusFilter;
    const matchAge = ageFilter === 'All' || m.ageCategory === ageFilter;
    return matchSearch && matchStatus && matchGender && matchCampus && matchAge;
  });

  const openSendInvite = (prefill?: SendInvitePrefill) => {
    setInvitePrefill(prefill);
    setShowInvitePanel(true);
  };

  const handleApproveRequest = (req: InviteRequest) => {
    openSendInvite({
      officialName: `${req.fullName} ${req.surname}`,
      email: req.email,
      requestId: req.id,
      campusId: req.campus,
    });
  };

  return (
    <AppShell access="staff">
      <PageHeader
        title="Members"
        subtitle="Manage members, review invite requests, and approve applications"
        actions={
          <button
            onClick={() => openSendInvite()}
            className="flex items-center gap-2 rounded-xl border border-ckc-gold/30 bg-ckc-gold/10 px-4 py-2.5 text-sm font-semibold text-ckc-gold transition-colors hover:bg-ckc-gold/20"
          >
            <Icon name="PaperAirplaneIcon" size={16} variant="outline" />
            Send Invite
          </button>
        }
      />

      <div className="flex gap-2 border-b border-white/10 pb-1">
        {[
          { id: 'requests' as Tab, label: 'Invite Requests' },
          { id: 'applications' as Tab, label: 'Pending Applications' },
          { id: 'members' as Tab, label: 'All Members' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.id ? 'border-b-2 border-ckc-gold text-ckc-gold' : 'text-cloud/40 hover:text-cloud'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'requests' ? (
        <ContentCard title="Pending requests" icon="InboxIcon">
          <InviteRequestsPanel
            key={requestsKey}
            onSendInvite={handleApproveRequest}
          />
          <p className="mt-4 text-xs text-cloud/30">
            Or use <strong className="text-cloud/50">Send Invite</strong> above to message someone directly — no request needed.
          </p>
          <p className="mt-1 text-xs text-cloud/30">
            After approval, the person receives an SMS link to complete the full 6-step membership form.
          </p>
        </ContentCard>
      ) : tab === 'applications' ? (
        <ContentCard title="Pending applications" icon="DocumentCheckIcon">
          <PendingApplicationsPanel />
          <p className="mt-4 text-xs text-cloud/30">
            Approve to create a member record. They can then sign in with their cell number.
          </p>
        </ContentCard>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Icon name="MagnifyingGlassIcon" size={16} variant="outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-cloud/30" />
              <input
                type="text"
                placeholder="Search members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-cloud placeholder-cloud/30 focus:border-ckc-gold/50 focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterPills label="Status" options={['All', 'Active', 'Inactive', 'New']} value={statusFilter} onChange={setStatusFilter} />
              <FilterPills label="Gender" options={['All', 'Male', 'Female']} value={genderFilter} onChange={setGenderFilter} />
              <FilterPills label="Age" options={['All', ...AGE_CATEGORIES.map((a) => a.id)]} labels={['All', ...AGE_CATEGORIES.map((a) => a.label)]} value={ageFilter} onChange={setAgeFilter} />
              <FilterPills label="Campus" options={['All', ...CAMPUSES.map((c) => c.id)]} labels={['All', ...CAMPUSES.map((c) => c.label)]} value={campusFilter} onChange={setCampusFilter} />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            {membersLoading ? (
              <div className="py-12 text-center text-sm text-cloud/40">Loading members from Supabase…</div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cloud/40">Member</th>
                    <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cloud/40 md:table-cell">Campus</th>
                    <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cloud/40 lg:table-cell">Ministry</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cloud/40">Status</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((member) => (
                    <tr key={member.id} className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/3">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-ckc-gold/10">
                            <span className="text-xs font-bold text-ckc-gold">{member.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-cloud">{member.name}</p>
                            <p className="text-xs text-cloud/40">{member.gender} · {AGE_CATEGORIES.find((a) => a.id === member.ageCategory)?.label}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-5 py-3.5 md:table-cell">
                        <span className="text-sm text-cloud/60">{getCampusLabel(member.campus)}</span>
                      </td>
                      <td className="hidden px-5 py-3.5 lg:table-cell">
                        <span className="text-sm text-cloud/60">{member.ministry}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusColors[member.status]}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => setSelectedMember(member)} className="text-cloud/30 transition-colors hover:text-ckc-gold">
                          <Icon name="EllipsisHorizontalIcon" size={18} variant="outline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
            {filtered.length === 0 && !membersLoading && (
              <div className="py-12 text-center text-cloud/30">
                <Icon name="UsersIcon" size={32} variant="outline" className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No members in Supabase yet — approve applications or run invite flow.</p>
              </div>
            )}
          </div>

          <p className="text-xs text-cloud/30">
            Member list comes from Supabase only — no dummy contacts shown.
          </p>
        </>
      )}

      {showInvitePanel && (
        <SendInvitePanel
          prefill={invitePrefill}
          onClose={() => {
            setShowInvitePanel(false);
            setInvitePrefill(undefined);
            setRequestsKey((k) => k + 1);
          }}
        />
      )}

      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1E293B] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-cloud">Member Profile</h2>
              <button onClick={() => setSelectedMember(null)} className="text-cloud/40 hover:text-cloud">
                <Icon name="XMarkIcon" size={20} variant="outline" />
              </button>
            </div>
            <div className="mb-5 flex items-center gap-4 border-b border-white/10 pb-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ckc-gold/10">
                <span className="text-xl font-bold text-ckc-gold">{selectedMember.name.charAt(0)}</span>
              </div>
              <div>
                <p className="text-lg font-bold text-cloud">{selectedMember.name}</p>
                <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusColors[selectedMember.status]}`}>
                  {selectedMember.status}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Campus', value: getCampusLabel(selectedMember.campus), icon: 'BuildingLibraryIcon' },
                { label: 'Email', value: selectedMember.email, icon: 'EnvelopeIcon' },
                { label: 'Phone', value: selectedMember.phone, icon: 'PhoneIcon' },
                { label: 'Ministry', value: selectedMember.ministry, icon: 'UserGroupIcon' },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <Icon name={row.icon} size={15} variant="outline" className="flex-shrink-0 text-cloud/30" />
                  <span className="w-16 text-xs text-cloud/40">{row.label}</span>
                  <span className="text-sm text-cloud">{row.value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedMember(null)}
              className="mt-6 w-full rounded-xl bg-ckc-gold py-2.5 text-sm font-bold text-ckc-black"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function FilterPills({
  label,
  options,
  labels,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  labels?: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="mr-1 text-[10px] uppercase tracking-wider text-cloud/30">{label}</span>
      {options.map((opt, i) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
            value === opt ? 'border-ckc-gold/30 bg-ckc-gold/10 text-ckc-gold' : 'border-white/10 text-cloud/50'
          }`}
        >
          {labels?.[i] ?? opt}
        </button>
      ))}
    </div>
  );
}