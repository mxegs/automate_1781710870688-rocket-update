'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { submitPrayerRequest } from '@/lib/prayer/service';
import { PRAYER_AUTO_REPLY, PRAYER_CATEGORIES } from '@/lib/prayer/types';
import { getDisplayName, getSession } from '@/lib/auth/session';
import { resolveMemberCampus } from '@/lib/member/campus';
import { useBackend } from '@/lib/api/client';

export default function MemberPrayerPage() {
  const [submitted, setSubmitted] = useState(false);
  const [autoReply, setAutoReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Health',
    contactPhone: '',
    contactEmail: '',
    isConfidential: false,
  });

  const session = getSession();
  const backend = useBackend();

  useEffect(() => {
    if (session?.phone) {
      setForm((f) => ({ ...f, contactPhone: session.phone }));
    }
  }, [session?.phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.contactPhone.trim() && !form.contactEmail.trim()) {
      setError('Please provide a phone number or email so we can reach you');
      return;
    }

    const campus = await resolveMemberCampus();
    if (!campus) {
      setError('Could not determine your campus');
      return;
    }

    setLoading(true);
    try {
      if (backend) {
        const result = await submitPrayerRequest({
          campus,
          submitterName: getDisplayName(session),
          contactPhone: form.contactPhone.trim() || undefined,
          contactEmail: form.contactEmail.trim() || undefined,
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          isConfidential: form.isConfidential,
        });
        setAutoReply(result.autoReply);
      } else {
        setAutoReply(PRAYER_AUTO_REPLY);
      }
      setSubmitted(true);
      setForm({
        title: '',
        description: '',
        category: 'Health',
        contactPhone: session?.phone ?? '',
        contactEmail: '',
        isConfidential: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell access="shared">
      <div className="life-section">
        <h1 className="mb-3 text-base font-medium text-ckc-black">Submit a prayer request</h1>

        {submitted ? (
          <div className="rounded-lg border border-ckc-gold/30 bg-ckc-gold/10 p-5 text-center">
            <h2 className="text-sm font-medium text-ckc-black">Prayer request sent</h2>
            <p className="mt-2 text-xs leading-relaxed text-ckc-muted">{autoReply}</p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-4 text-xs font-medium text-ckc-gold hover:underline"
            >
              Submit another request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2.5">
            <div>
              <label className="mb-1 block text-[11px] text-ckc-black">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="life-input"
              >
                {PRAYER_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] text-ckc-black">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="Brief title"
                className="life-input"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] text-ckc-black">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                rows={3}
                className="life-input"
              />
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] text-ckc-black">Phone</label>
                <input
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  placeholder="071 234 5678"
                  className="life-input"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-ckc-black">Email</label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  placeholder="you@email.com"
                  className="life-input"
                />
              </div>
            </div>

            <label className="flex items-center gap-1.5 text-[11px] text-ckc-black">
              <input
                type="checkbox"
                checked={form.isConfidential}
                onChange={(e) => setForm({ ...form, isConfidential: e.target.checked })}
                className="h-3.5 w-3.5 rounded border-ckc-gold accent-ckc-gold"
              />
              Keep confidential
            </label>

            {error && <p className="text-xs text-rose-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-life-primary w-full py-3 text-[13px] disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Submit request'}
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}
