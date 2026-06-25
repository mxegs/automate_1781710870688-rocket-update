'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthShell from '@/components/auth/AuthShell';
import { CkcButton, CkcCard, CkcField, CkcInput } from '@/components/ui/CkcForm';
import { setProfilePassword } from '@/lib/auth/password';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Missing reset link. Request a new one from the forgot password page.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await setProfilePassword({ setupToken: token, password });
      setDone(true);
      setTimeout(() => router.replace('/login'), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell subtitle="Choose a new password">
      <CkcCard>
        {done ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
              <span className="text-xl">✓</span>
            </div>
            <h2 className="text-base font-semibold text-ckc-white">Password updated</h2>
            <p className="text-xs text-ckc-muted">Redirecting you to sign in…</p>
          </div>
        ) : error && !token ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-red-400">{error}</p>
            <Link href="/forgot-password" className="text-sm text-ckc-gold hover:underline">
              Request a new reset link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-base font-semibold text-ckc-white">New password</h2>
            <p className="text-xs text-ckc-muted">Choose a new password for your CKC account.</p>

            <CkcField label="New password" required>
              <CkcInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="At least 8 characters"
              />
            </CkcField>

            <CkcField label="Confirm password" required>
              <CkcInput
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </CkcField>

            {error && token && <p className="text-xs text-red-400">{error}</p>}

            <CkcButton type="submit" disabled={loading || !token}>
              {loading ? 'Saving…' : 'Save new password'}
            </CkcButton>
          </form>
        )}
      </CkcCard>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ckc-black" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
