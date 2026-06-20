'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AuthShell from '@/components/auth/AuthShell';
import { CkcButton, CkcCard, CkcField, CkcInput } from '@/components/ui/CkcForm';
import { CAMPUSES, getCampusLabel, type CampusId } from '@/lib/church/constants';
import { submitInviteRequest } from '@/lib/invites/request-service';
import { BRAND } from '@/lib/assets';

export default function RequestInvitePage() {
  const [surname, setSurname] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [campus, setCampus] = useState<CampusId>('midrand');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surname.trim() || !fullName.trim()) {
      setError('Please enter your name and surname.');
      return;
    }
    if (!email.trim().includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await submitInviteRequest({ surname, fullName, email: email.trim(), campus });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell subtitle="Request church membership">
      <CkcCard>
        {submitted ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ckc-gold/20">
              <span className="text-xl">✓</span>
            </div>
            <h2 className="text-base font-semibold text-ckc-white">Request received</h2>
            <p className="text-xs leading-relaxed text-ckc-muted">
              Thank you, {fullName}. Your {getCampusLabel(campus)} admin will review your request and email
              you an invite link to <strong className="text-ckc-white">{email.trim().toLowerCase()}</strong>.
            </p>
            <Link href="/login" className="block text-sm text-ckc-gold hover:underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <span className="ckc-label-pill">Step 1 of membership</span>
            <h2 className="text-base font-semibold text-ckc-white">Request an invite</h2>
            <p className="text-xs text-ckc-muted">
              Your name, email, and campus — no phone needed here. An admin at your campus will email
              you a link to complete the full membership form.
            </p>

            <CkcField label="Surname" required>
              <CkcInput value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Surname" />
            </CkcField>

            <CkcField label="First name(s)" required>
              <CkcInput value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="First name" />
            </CkcField>

            <CkcField label="Email address" required>
              <CkcInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </CkcField>

            <CkcField label="Campus" required>
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value as CampusId)}
                className="w-full rounded-lg border border-white/10 bg-ckc-elevated px-3 py-2.5 text-sm text-ckc-white focus:border-ckc-gold/50 focus:outline-none"
              >
                {CAMPUSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </CkcField>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <CkcButton type="submit" disabled={loading}>
              {loading ? 'Submitting…' : 'Submit Request'}
            </CkcButton>
          </form>
        )}
      </CkcCard>

      <p className="mt-6 text-center text-xs text-ckc-dim">
        Already have an invite?{' '}
        <Link href="/login" className="text-ckc-gold hover:underline">
          Sign in
        </Link>
        {' · '}
        Just visiting?{' '}
        <Link href="/login?mode=visitor" className="text-ckc-gold hover:underline">
          Continue as visitor
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-ckc-dim">Questions? Call {BRAND.supportPhone}</p>
    </AuthShell>
  );
}
