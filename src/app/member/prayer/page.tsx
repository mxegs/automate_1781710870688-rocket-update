'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import LifeHero from '@/components/church-life/LifeHero';
import { LIFE_PHOTOS } from '@/lib/church-life/imagery';
import { submitPrayerRequest } from '@/lib/prayer/service';
import { PRAYER_CATEGORIES } from '@/lib/prayer/types';
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
      if (!backend) {
        setError('Prayer requests are unavailable right now. Please try again later.');
        return;
      }

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
    <AppShell access="member">
      <div className="px-5 pb-8 pt-5">
        <LifeHero
          imageUrl={LIFE_PHOTOS.prayer}
          titleLead="We would love to pray with you"
          titleRest="Share a request and our team will stand with you"
          badge="Prayer"
        />

        <div className="mt-6">
          {submitted ? (
            <div className="rounded-[24px] bg-white p-8 text-center shadow-[0_10px_28px_rgba(26,22,18,0.08)]">
              <h2 className="font-serif text-[24px] font-semibold text-ckc-black">Prayer request sent</h2>
              <p className="mt-3 text-sm leading-relaxed text-ckc-muted">{autoReply}</p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-5 text-sm font-medium text-ckc-gold-dim"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ckc-black">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="life-input"
                >
                  {PRAYER_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ckc-black">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="Brief title"
                  className="life-input"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ckc-black">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={4}
                  className="life-input"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ckc-black">Phone</label>
                  <input
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    placeholder="071 234 5678"
                    className="life-input"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ckc-black">Email</label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    placeholder="you@email.com"
                    className="life-input"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-ckc-black">
                <input
                  type="checkbox"
                  checked={form.isConfidential}
                  onChange={(e) => setForm({ ...form, isConfidential: e.target.checked })}
                  className="h-4 w-4 rounded border-ckc-gold accent-ckc-gold"
                />
                Keep confidential
              </label>

              {error && <p className="text-sm text-rose-500">{error}</p>}

              <button type="submit" disabled={loading} className="btn-life-primary w-full py-3.5 disabled:opacity-50">
                {loading ? 'Sending…' : 'Submit request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </AppShell>
  );
}
