'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import { submitPrayerRequest } from '@/lib/prayer/service';
import { PRAYER_AUTO_REPLY, PRAYER_CATEGORIES } from '@/lib/prayer/types';
import { getDisplayName, getSession } from '@/lib/auth/session';
import { resolveMemberCampus } from '@/lib/member/campus';
import { getCampusLabel } from '@/lib/church/constants';
import { useBackend } from '@/lib/api/client';

export default function MemberPrayerPage() {
  const [submitted, setSubmitted] = useState(false);
  const [autoReply, setAutoReply] = useState('');
  const [campusLabel, setCampusLabel] = useState('');
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
    resolveMemberCampus().then((c) => {
      if (c) setCampusLabel(getCampusLabel(c));
    });
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
      <div className="max-w-xl mx-auto">
        <div className="mb-6 text-center">
          <Icon name="HeartIcon" size={40} variant="outline" className="mx-auto text-ckc-gold mb-3" />
          <h1 className="text-2xl font-bold text-ckc-black">Submit a Prayer Request</h1>
          <p className="text-ckc-muted text-sm mt-1">
            {campusLabel
              ? `Your request goes directly to ${campusLabel} pastors and prayer team`
              : 'Your campus pastor and prayer team will receive your request'}
          </p>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-ckc-gold/30 bg-ckc-gold/10 p-6 text-center">
            <Icon name="CheckCircleIcon" size={40} variant="solid" className="mx-auto text-ckc-gold mb-3" />
            <h2 className="text-lg font-bold text-ckc-black">Prayer request sent</h2>
            <p className="text-sm text-ckc-black/70 mt-3 leading-relaxed">{autoReply}</p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-6 text-sm text-ckc-gold font-semibold hover:underline"
            >
              Submit another request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl bg-neutral-50 border border-[#E5E5E5] bg-neutral-50 p-6 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ckc-muted">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="Brief title for your request"
                className="w-full rounded-lg bg-neutral-50 border border-[#E5E5E5] bg-neutral-50 px-3 py-2.5 text-sm text-ckc-black"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-ckc-muted">Prayer request</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                rows={4}
                placeholder="Share what you'd like us to pray for…"
                className="w-full rounded-lg bg-neutral-50 border border-[#E5E5E5] bg-neutral-50 px-3 py-2.5 text-sm text-ckc-black"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-ckc-muted">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg bg-neutral-50 border border-[#E5E5E5] bg-neutral-50 px-3 py-2.5 text-sm text-ckc-black"
              >
                {PRAYER_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-ckc-muted">Phone</label>
                <input
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  placeholder="082 123 4567"
                  className="w-full rounded-lg bg-neutral-50 border border-[#E5E5E5] bg-neutral-50 px-3 py-2.5 text-sm text-ckc-black"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ckc-muted">Email</label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  placeholder="you@email.com"
                  className="w-full rounded-lg bg-neutral-50 border border-[#E5E5E5] bg-neutral-50 px-3 py-2.5 text-sm text-ckc-black"
                />
              </div>
            </div>
            <p className="text-[10px] text-ckc-muted/80">Phone or email required — for automated confirmation</p>

            <label className="flex items-center gap-2 text-xs text-ckc-muted">
              <input
                type="checkbox"
                checked={form.isConfidential}
                onChange={(e) => setForm({ ...form, isConfidential: e.target.checked })}
                className="accent-ckc-gold"
              />
              Keep this request confidential (only pastors see your name)
            </label>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-ckc-gold py-3 text-sm font-bold text-ckc-black disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send Prayer Request'}
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}
