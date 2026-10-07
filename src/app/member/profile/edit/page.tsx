'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { apiFetch } from '@/lib/api/client';
import { MARITAL_STATUSES, showMarriageDate } from '@/lib/members/own-profile';

interface EditProfile {
  fullName: string;
  dateOfBirth: string | null;
  identityNumber: string | null;
  campusName: string;
  churchName: string;
  status: string | null;
  role: string | null;
  phone: string;
  email: string | null;
  pendingEmail: string | null;
  address: string;
  occupation: string;
  maritalStatus: string | null;
  marriageDate: string | null;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
}

function Locked({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-ckc-muted">{label}</p>
      <p className="text-sm text-ckc-muted">{value || '—'}</p>
      <p className="text-xs text-ckc-muted">Contact your church to update this.</p>
    </div>
  );
}

export default function MemberProfileEditPage() {
  const router = useRouter();
  const [form, setForm] = useState<EditProfile | null>(null);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiFetch<EditProfile>('/api/me/profile')
      .then((data) => {
        if (!cancelled) setForm(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load profile');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const validate = (): boolean => {
    if (!form) return false;
    const next: Record<string, string> = {};
    if ((form.phone.replace(/\D/g, '')).length < 9) next.phone = 'Phone must have at least 9 digits';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address';
    if (form.maritalStatus && !MARITAL_STATUSES.includes(form.maritalStatus as (typeof MARITAL_STATUSES)[number])) {
      next.maritalStatus = 'Select a marital status';
    }
    if (showMarriageDate(form.maritalStatus ?? '') && form.marriageDate && !/^\d{4}-\d{2}-\d{2}$/.test(form.marriageDate)) {
      next.marriageDate = 'Enter a valid date';
    }
    setFieldError(next);
    return Object.keys(next).length === 0;
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !validate()) return;
    setSaving(true);
    setError('');
    try {
      await apiFetch('/api/me/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          phone: form.phone,
          email: form.email,
          address: form.address,
          occupation: form.occupation,
          maritalStatus: form.maritalStatus,
          marriageDate: showMarriageDate(form.maritalStatus ?? '') ? form.marriageDate : '',
          emergencyContactName: form.emergencyContactName,
          emergencyContactRelationship: form.emergencyContactRelationship,
          emergencyContactPhone: form.emergencyContactPhone,
        }),
      });
      router.push('/member/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell access="member">
      <div className="px-5 pb-10 pt-5">
        <h1 className="mb-4 font-serif text-2xl font-semibold text-ckc-black">Edit profile</h1>
        {loading ? <p className="text-sm text-ckc-muted">Loading…</p> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        {form ? (
          <form onSubmit={save} className="space-y-6">
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ckc-muted">Locked</h2>
              <Locked label="Full name" value={form.fullName} />
              <Locked label="Date of birth" value={form.dateOfBirth ?? ''} />
              <Locked label="Identity number" value={form.identityNumber ?? ''} />
              <Locked label="Campus" value={form.campusName} />
              <Locked label="Church" value={form.churchName} />
              <Locked label="Membership status" value={form.status ?? ''} />
              <Locked label="Role" value={form.role ?? ''} />
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ckc-muted">Editable</h2>
              <label className="block text-sm text-ckc-black">
                Phone number
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-ckc-black/20 px-3 py-2 text-sm"
                />
                {fieldError.phone ? <span className="text-xs text-red-700">{fieldError.phone}</span> : null}
              </label>
              <label className="block text-sm text-ckc-black">
                Email
                <input
                  type="email"
                  value={form.email ?? ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-ckc-black/20 px-3 py-2 text-sm"
                />
                {fieldError.email ? <span className="text-xs text-red-700">{fieldError.email}</span> : null}
              </label>
              <label className="block text-sm text-ckc-black">
                Address
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-ckc-black/20 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm text-ckc-black">
                Occupation
                <input
                  value={form.occupation}
                  onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-ckc-black/20 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm text-ckc-black">
                Marital status
                <select
                  value={form.maritalStatus ?? ''}
                  onChange={(e) => setForm({ ...form, maritalStatus: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-ckc-black/20 px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  {MARITAL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {fieldError.maritalStatus ? (
                  <span className="text-xs text-red-700">{fieldError.maritalStatus}</span>
                ) : null}
              </label>
              {showMarriageDate(form.maritalStatus ?? '') ? (
                <label className="block text-sm text-ckc-black">
                  Marriage date
                  <input
                    type="date"
                    value={form.marriageDate ?? ''}
                    onChange={(e) => setForm({ ...form, marriageDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-ckc-black/20 px-3 py-2 text-sm"
                  />
                  {fieldError.marriageDate ? (
                    <span className="text-xs text-red-700">{fieldError.marriageDate}</span>
                  ) : null}
                </label>
              ) : null}
              <label className="block text-sm text-ckc-black">
                Emergency contact name
                <input
                  value={form.emergencyContactName}
                  onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-ckc-black/20 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm text-ckc-black">
                Emergency contact relationship
                <input
                  value={form.emergencyContactRelationship}
                  onChange={(e) => setForm({ ...form, emergencyContactRelationship: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-ckc-black/20 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm text-ckc-black">
                Emergency contact phone
                <input
                  value={form.emergencyContactPhone}
                  onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-ckc-black/20 px-3 py-2 text-sm"
                />
              </label>
            </section>

            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="rounded-lg bg-ckc-gold px-4 py-2 text-sm text-ckc-black">
                {saving ? 'Saving…' : 'Save'}
              </button>
              <Link href="/member/profile" className="rounded-lg border border-ckc-black/20 px-4 py-2 text-sm text-ckc-black">
                Cancel
              </Link>
            </div>
          </form>
        ) : null}
      </div>
    </AppShell>
  );
}
