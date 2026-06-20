'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import PageHeader, { ContentCard } from '@/components/portal/PageHeader';
import { CkcButton, CkcField, CkcInput } from '@/components/ui/CkcForm';
import { CAMPUSES, getCampusLabel, type CampusId } from '@/lib/church/constants';
import { getSession } from '@/lib/auth/session';
import { assignStaffRole, listStaffProfiles, removeStaffRole } from '@/lib/staff/service';
import type { AssignableStaffRole, StaffProfile } from '@/lib/staff/types';
import { apiFetch, staffHeaders, useBackend } from '@/lib/api/client';

interface MemberOption {
  email: string;
  fullName: string;
  campusId: CampusId;
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin (church-wide)',
  admin: 'Campus Admin',
  pastor: 'Campus Pastor',
  leader: 'Group / Ministry Leader',
};

export default function TeamPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '',
    displayName: '',
    campusId: 'midrand' as CampusId,
    role: 'admin' as AssignableStaffRole,
  });
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setStaff(await listStaffProfiles());
      if (useBackend()) {
        const rows = await apiFetch<
          { email?: string | null; full_name: string; campus_id: string }[]
        >('/api/members', { headers: staffHeaders() });
        setMembers(
          rows
            .filter((m) => m.email?.includes('@'))
            .map((m) => ({
              email: m.email!.toLowerCase(),
              fullName: m.full_name,
              campusId: m.campus_id as CampusId,
            })),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load team');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const session = getSession();
    if (!session?.isSuperAdmin) {
      router.replace('/dashboard');
      return;
    }
    refresh();
  }, [router, refresh]);

  const pickMember = (email: string) => {
    const member = members.find((m) => m.email === email);
    if (!member) return;
    setForm({
      email: member.email,
      displayName: member.fullName,
      campusId: member.campusId,
      role: 'admin',
    });
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await assignStaffRole({
        email: form.email.trim(),
        displayName: form.displayName.trim(),
        campusId: form.campusId,
        role: form.role,
      });
      setForm({ email: '', displayName: '', campusId: 'midrand', role: 'admin' });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not assign role');
    } finally {
      setSaving(false);
    }
  };

  const handleDemote = async (person: StaffProfile) => {
    if (person.role === 'super_admin') return;
    if (!confirm(`Remove staff access for ${person.displayName}? They become a regular member.`)) return;
    await removeStaffRole(person.id);
    await refresh();
  };

  return (
    <AppShell access="staff">
      <PageHeader
        title="Team & Roles"
        subtitle="Assign campus admins and leaders — the foundation for invites, groups, and campus operations"
      />

      <ContentCard title="How roles connect" icon="UserGroupIcon">
        <ul className="space-y-2 text-xs text-cloud/60 leading-relaxed list-disc pl-4">
          <li>
            <strong className="text-cloud/80">Super Admin (you)</strong> — assigns campus admins here; sees all campuses.
          </li>
          <li>
            <strong className="text-cloud/80">Campus Admin / Pastor</strong> — approves invite requests, sends member
            invites, manages groups & events for their campus only.
          </li>
          <li>
            <strong className="text-cloud/80">Group Leader</strong> — runs My Groups (messaging, song library); assigned
            when a campus admin sets them as leader on the Groups page.
          </li>
          <li>
            Invite request SMS alerts go to the campus admin for that campus.
          </li>
        </ul>
      </ContentCard>

      <ContentCard title="Assign campus admin or leader" icon="ShieldCheckIcon">
        <form onSubmit={handleAssign} className="space-y-4 max-w-lg">
          {members.length > 0 && (
            <CkcField label="Pick from existing members (optional)">
              <select
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-cloud"
                value=""
                onChange={(e) => pickMember(e.target.value)}
              >
                <option value="">— Select member —</option>
                {members.map((m) => (
                  <option key={m.email} value={m.email}>
                    {m.fullName} ({m.email}) · {getCampusLabel(m.campusId)}
                  </option>
                ))}
              </select>
            </CkcField>
          )}

          <CkcField label="Email (sign-in address)" required>
            <CkcInput
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="admin@example.com"
            />
          </CkcField>

          <CkcField label="Display name" required>
            <CkcInput
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              placeholder="Campus admin name"
            />
          </CkcField>

          <div className="grid grid-cols-2 gap-3">
            <CkcField label="Campus" required>
              <select
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-cloud"
                value={form.campusId}
                onChange={(e) => setForm((f) => ({ ...f, campusId: e.target.value as CampusId }))}
              >
                {CAMPUSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </CkcField>

            <CkcField label="Role" required>
              <select
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-cloud"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as AssignableStaffRole }))}
              >
                <option value="admin">Campus Admin</option>
                <option value="pastor">Campus Pastor</option>
                <option value="leader">Group Leader</option>
              </select>
            </CkcField>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <CkcButton type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Assign role'}
          </CkcButton>
        </form>
      </ContentCard>

      <ContentCard title="Current team" icon="UsersIcon">
        {loading ? (
          <p className="text-sm text-cloud/40">Loading…</p>
        ) : staff.length === 0 ? (
          <p className="text-sm text-cloud/40">No staff profiles yet.</p>
        ) : (
          <div className="space-y-2">
            {staff.map((person) => (
              <div
                key={person.id}
                className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-cloud">{person.displayName}</p>
                  <p className="text-xs text-cloud/40">
                    {person.email} · {ROLE_LABELS[person.role] ?? person.role}
                    {person.campusId ? ` · ${getCampusLabel(person.campusId)}` : ' · All campuses'}
                  </p>
                </div>
                {person.role !== 'super_admin' && (
                  <button
                    type="button"
                    onClick={() => handleDemote(person)}
                    className="text-xs text-rose-400 hover:text-rose-300"
                  >
                    Remove staff access
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </ContentCard>
    </AppShell>
  );
}
