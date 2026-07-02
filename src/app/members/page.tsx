'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import PageHeader, { ContentCard } from '@/components/portal/PageHeader';
import SendInvitePanel, { type SendInvitePrefill } from '@/components/admin/SendInvitePanel';
import InviteRequestsPanel from '@/components/admin/InviteRequestsPanel';
import PendingApplicationsPanel from '@/components/admin/PendingApplicationsPanel';
import MemberManageMenu, { type MemberRow } from '@/components/admin/MemberManageMenu';
import { AGE_CATEGORIES, CAMPUSES, getCampusLabel, type CampusId } from '@/lib/church/constants';
import type { InviteRequest } from '@/lib/invites/request-service';
import { apiFetch, useBackend } from '@/lib/api/client';
import { formatPhoneDisplay } from '@/lib/auth/session';

interface Member extends MemberRow {
  ministry: string;
  joinDate: string;
  ageCategory: 'child' | 'youth' | 'adult';
  baptised: boolean;
  displayStatus: 'Active' | 'Suspended' | 'New';
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
  const dbStatus = row.status as Member['dbStatus'];
  let displayStatus: Member['displayStatus'] = 'Active';
  if (dbStatus === 'suspended' || dbStatus === 'inactive') displayStatus = 'Suspended';
  else if (dbStatus === 'pending') displayStatus = 'New';

  return {
    id: row.id,
    name: row.full_name,
    email: row.email ?? '',
    phone: formatPhoneDisplay(row.phone),
    dbStatus,
    displayStatus,
    ministry: '—',
    joinDate: row.member_since,
    gender: row.gender === 'Male' || row.gender === 'Female' ? row.gender : 'Unknown',
    ageCategory: ageToCategory(row.age),
    campus: row.campus_id as CampusId,
    baptised: false,
  };
}

const statusColors: Record<string, string> = {
  Active: 'bg-ckc-gold/10 text-ckc-gold border-ckc-gold/20',
  Suspended: 'bg-ckc-gold/10 text-ckc-gold border-ckc-gold/20',
  New: 'bg-ckc-gold/10 text-ckc-gold border-ckc-gold/20',
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
  const [requestsKey, setRequestsKey] = useState(0);
  const [membersKey, setMembersKey] = useState(0);

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
  }, [backend, tab, requestsKey, membersKey]);

  const filtered = members.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.ministry.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || m.displayStatus === statusFilter;
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
      givenName: req.fullName,
      surname: req.surname,
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
            Open an application to review all details (next of kin, dependants, spiritual background)
            before approving. Approved members sign in with email + password.
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
              <FilterPills label="Status" options={['All', 'Active', 'Suspended', 'New']} value={statusFilter} onChange={setStatusFilter} />
              <FilterPills label="Gender" options={['All', 'Male', 'Female']} value={genderFilter} onChange={setGenderFilter} />
              <FilterPills label="Age" options={['All', ...AGE_CATEGORIES.map((a) => a.id)]} labels={['All', ...AGE_CATEGORIES.map((a) => a.label)]} value={ageFilter} onChange={setAgeFilter} />
              <FilterPills label="Campus" options={['All', ...CAMPUSES.map((c) => c.id)]} labels={['All', ...CAMPUSES.map((c) => c.label)]} value={campusFilter} onChange={setCampusFilter} />
            </div>
          </div>

          <div className="space-y-2">
            {membersLoading ? (
              <div className="py-12 text-center text-sm text-cloud/40">Loading members from Supabase…</div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-cloud/30">
                <Icon name="UsersIcon" size={32} variant="outline" className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No members in Supabase yet — approve applications or run invite flow.</p>
              </div>
            ) : (
              filtered.map((member) => (
                <div
                  key={member.id}
                  className="flex w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-ckc-gold/10">
                      <span className="text-xs font-bold text-ckc-gold">{member.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-cloud">{member.name}</p>
                      <p className="truncate text-xs text-cloud/40">
                        {getCampusLabel(member.campus)} · {member.gender} · {member.email || member.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3">
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[member.displayStatus]}`}>
                      {member.displayStatus}
                    </span>
                    <MemberManageMenu member={member} onUpdated={() => setMembersKey((k) => k + 1)} />
                  </div>
                </div>
              ))
            )}
          </div>

          <p className="text-xs text-cloud/30">
            Use the ··· menu to view full membership info, suspend, or terminate. Suspended members cannot sign in or receive messages.
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