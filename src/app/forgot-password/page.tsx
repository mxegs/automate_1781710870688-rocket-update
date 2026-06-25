'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AuthShell from '@/components/auth/AuthShell';
import { CkcButton, CkcCard, CkcField, CkcInput } from '@/components/ui/CkcForm';
import { requestPasswordReset } from '@/lib/auth/password';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [demoLink, setDemoLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim().includes('@')) {
      setError('Enter a valid email address.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const result = await requestPasswordReset(email.trim());
      if (result.demoLink) setDemoLink(result.demoLink);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell subtitle="Reset your password">
      <CkcCard>
        {sent ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ckc-gold/20">
              <span className="text-xl">✉</span>
            </div>
            <h2 className="text-base font-semibold text-ckc-white">Check your email</h2>
            <p className="text-xs leading-relaxed text-ckc-muted">
              If <strong className="text-ckc-white">{email.trim().toLowerCase()}</strong> is registered,
              we sent a link to choose a new password.
            </p>
            {demoLink && (
              <p className="text-xs text-amber-400/90">
                Demo mode:{' '}
                <Link href={demoLink} className="underline">
                  use this test link
                </Link>
              </p>
            )}
            <Link href="/login" className="block text-sm text-ckc-gold hover:underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-base font-semibold text-ckc-white">Forgot password?</h2>
            <p className="text-xs text-ckc-muted">
              Enter your registered email. We&apos;ll send a one-time link to set a new password.
            </p>

            <CkcField label="Email address" required>
              <CkcInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </CkcField>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <CkcButton type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Email me a reset link'}
            </CkcButton>

            <Link href="/login" className="block text-center text-xs text-ckc-muted hover:text-ckc-gold">
              Back to sign in
            </Link>
          </form>
        )}
      </CkcCard>
    </AuthShell>
  );
}
