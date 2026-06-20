'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthShell from '@/components/auth/AuthShell';
import { CkcButton, CkcCard, CkcField, CkcInput } from '@/components/ui/CkcForm';
import { setMemberPassword } from '@/lib/auth/password';
import { apiFetch } from '@/lib/api/client';

const SETUP_KEY = 'ckc_password_setup';

interface SetupMeta {
  id: string;
  email: string;
}

function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('id') ?? '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!applicationId) {
      setError('Missing application reference. Complete the membership form first.');
      return;
    }

    const cached = sessionStorage.getItem(SETUP_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as SetupMeta;
        if (parsed.id === applicationId) {
          setEmail(parsed.email);
          setReady(true);
          return;
        }
      } catch {
        /* fall through */
      }
    }

    apiFetch<{ email: string }>(`/api/membership-applications/${applicationId}/setup`)
      .then((res) => {
        setEmail(res.email);
        setReady(true);
      })
      .catch(() => {
        setError('Could not load your application. Complete the membership form first.');
      });
  }, [applicationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      await setMemberPassword({ applicationId, password });
      sessionStorage.removeItem(SETUP_KEY);
      router.push('/signup/success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell subtitle="Create your sign-in password">
      <CkcCard>
        {!ready && !error ? (
          <p className="text-center text-sm text-ckc-muted">Loading…</p>
        ) : error && !ready ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-red-400">{error}</p>
            <Link href="/login" className="text-sm text-ckc-gold hover:underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <span className="ckc-label-pill">Almost done</span>
            <h2 className="text-base font-semibold text-ckc-white">Choose a password</h2>
            <p className="text-xs leading-relaxed text-ckc-muted">
              Choose a password for when you are approved. We will email and SMS you as soon as your
              application is reviewed — please wait for that message before signing in.
            </p>

            <CkcField label="Email">
              <CkcInput type="email" value={email} readOnly className="opacity-70" />
            </CkcField>

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

            {error && ready && <p className="text-xs text-red-400">{error}</p>}

            <CkcButton type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Save password & finish'}
            </CkcButton>
          </form>
        )}
      </CkcCard>
    </AuthShell>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ckc-black" />}>
      <SetPasswordForm />
    </Suspense>
  );
}
