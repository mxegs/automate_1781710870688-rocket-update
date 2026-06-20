'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthShell from '@/components/auth/AuthShell';
import { CkcButton, CkcCard, CkcField, CkcInput } from '@/components/ui/CkcForm';
import { setProfilePassword } from '@/lib/auth/password';
import {
  getPostLoginRoute,
  resolveSessionFromEmailAsync,
  setSession,
} from '@/lib/auth/session';

function SetProfilePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setupToken = searchParams.get('token') ?? '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!setupToken) {
      setError('Missing setup link. Sign in with your email link first.');
    }
  }, [setupToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupToken) return;
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
      const result = await setProfilePassword({ setupToken, password });
      setEmail(result.email);
      const session = await resolveSessionFromEmailAsync(result.email);
      setSession(session);
      router.replace(getPostLoginRoute(session.role, session.viewMode));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell subtitle="Create your sign-in password">
      <CkcCard>
        {error && !setupToken ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-red-400">{error}</p>
            <Link href="/login" className="text-sm text-ckc-gold hover:underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <span className="ckc-label-pill">One-time setup</span>
            <h2 className="text-base font-semibold text-ckc-white">Choose a password</h2>
            <p className="text-xs leading-relaxed text-ckc-muted">
              Set a password for staff sign-in. After this, use your email and password on the login
              page — no email link each time.
            </p>

            {email && (
              <CkcField label="Account">
                <CkcInput type="email" value={email} readOnly className="opacity-70" />
              </CkcField>
            )}

            <CkcField label="Password" required>
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

            {error && setupToken && <p className="text-xs text-red-400">{error}</p>}

            <CkcButton type="submit" disabled={loading || !setupToken}>
              {loading ? 'Saving…' : 'Save password & continue'}
            </CkcButton>
          </form>
        )}
      </CkcCard>
    </AuthShell>
  );
}

export default function SetProfilePasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ckc-black" />}>
      <SetProfilePasswordForm />
    </Suspense>
  );
}
