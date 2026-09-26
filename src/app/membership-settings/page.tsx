'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import PageHeader, { ContentCard } from '@/components/portal/PageHeader';
import { CkcButton, CkcField, CkcInput } from '@/components/ui/CkcForm';
import { apiFetch } from '@/lib/api/client';
import { isNoExpiry, type MembershipSettings } from '@/lib/church/membership-settings';

export default function MembershipSettingsPage() {
  const [form, setForm] = useState({
    membershipDurationDays: 365,
    renewalReminderDays: 30,
    renewalFinalDays: 7,
    autoApproveRenewals: false,
    gracePeriodDays: 14,
    noExpiry: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiFetch<MembershipSettings>('/api/membership-settings')
      .then((settings) => {
        if (cancelled) return;
        setForm({
          membershipDurationDays: isNoExpiry(settings.membershipDurationDays)
            ? 365
            : settings.membershipDurationDays,
          renewalReminderDays: settings.renewalReminderDays,
          renewalFinalDays: settings.renewalFinalDays,
          autoApproveRenewals: settings.autoApproveRenewals,
          gracePeriodDays: settings.gracePeriodDays,
          noExpiry: isNoExpiry(settings.membershipDurationDays),
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load settings');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    setSaving(true);
    try {
      const next = await apiFetch<MembershipSettings>('/api/membership-settings', {
        method: 'PATCH',
        body: JSON.stringify({
          membershipDurationDays: form.noExpiry ? 0 : form.membershipDurationDays,
          renewalReminderDays: form.renewalReminderDays,
          renewalFinalDays: form.renewalFinalDays,
          autoApproveRenewals: form.autoApproveRenewals,
          gracePeriodDays: form.gracePeriodDays,
        }),
      });
      setForm((current) => ({
        ...current,
        membershipDurationDays: isNoExpiry(next.membershipDurationDays) ? 365 : next.membershipDurationDays,
        renewalReminderDays: next.renewalReminderDays,
        renewalFinalDays: next.renewalFinalDays,
        autoApproveRenewals: next.autoApproveRenewals,
        gracePeriodDays: next.gracePeriodDays,
        noExpiry: isNoExpiry(next.membershipDurationDays),
      }));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell access="staff">
      <PageHeader
        title="Membership Settings"
        subtitle="How long membership lasts at this church, and when renewal reminders go out."
      />

      <ContentCard title="Duration and renewals" icon="Cog6ToothIcon">
        {loading ? (
          <p className="text-sm text-cloud/50">Loading…</p>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            {error && <p className="text-sm text-rose-400">{error}</p>}
            {saved && <p className="text-sm text-ckc-gold">Saved for this church only.</p>}

            <label className="flex items-center gap-3 text-sm text-cloud">
              <input
                type="checkbox"
                checked={form.noExpiry}
                onChange={(e) => setForm((f) => ({ ...f, noExpiry: e.target.checked }))}
              />
              No expiry — membership never ends
            </label>

            <CkcField label="Membership duration (days)" required>
              <CkcInput
                type="number"
                min={1}
                step={1}
                disabled={form.noExpiry}
                value={form.membershipDurationDays}
                onChange={(e) =>
                  setForm((f) => ({ ...f, membershipDurationDays: Number(e.target.value) }))
                }
              />
            </CkcField>

            <CkcField label="First renewal reminder (days before expiry)" required>
              <CkcInput
                type="number"
                min={0}
                step={1}
                value={form.renewalReminderDays}
                onChange={(e) => setForm((f) => ({ ...f, renewalReminderDays: Number(e.target.value) }))}
              />
            </CkcField>

            <CkcField label="Final renewal reminder (days before expiry)" required>
              <CkcInput
                type="number"
                min={0}
                step={1}
                value={form.renewalFinalDays}
                onChange={(e) => setForm((f) => ({ ...f, renewalFinalDays: Number(e.target.value) }))}
              />
            </CkcField>

            <CkcField label="Grace period after expiry (days)" required>
              <CkcInput
                type="number"
                min={0}
                step={1}
                value={form.gracePeriodDays}
                onChange={(e) => setForm((f) => ({ ...f, gracePeriodDays: Number(e.target.value) }))}
              />
            </CkcField>

            <label className="flex items-center gap-3 text-sm text-cloud">
              <input
                type="checkbox"
                checked={form.autoApproveRenewals}
                onChange={(e) => setForm((f) => ({ ...f, autoApproveRenewals: e.target.checked }))}
              />
              Auto-approve renewals
            </label>

            <CkcButton type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save settings'}
            </CkcButton>
          </form>
        )}
      </ContentCard>
    </AppShell>
  );
}
