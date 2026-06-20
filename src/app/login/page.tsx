'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthShell from '@/components/auth/AuthShell';
import { CkcButton, CkcCard, CkcField, CkcInput } from '@/components/ui/CkcForm';
import { checkEmailLoginOptions, loginWithPassword } from '@/lib/auth/password';
import { sendMagicLink } from '@/lib/auth/magic-link';
import {
  getPostLoginRoute,
  isRegisteredMemberEmail,
  isStaffRole,
  normalizeEmailValue,
  resolveSessionFromEmailAsync,
  setSession,
} from '@/lib/auth/session';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isVisitor = searchParams.get('mode') === 'visitor';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [demoLink, setDemoLink] = useState('');
  const [loginMode, setLoginMode] = useState<'password' | 'magic'>('password');
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);

  const normalizedEmail = normalizeEmailValue(email);

  const refreshLoginOptions = async (value: string) => {
    const normalized = normalizeEmailValue(value);
    if (!normalized.includes('@')) {
      setHasPassword(null);
      return;
    }
    if (isVisitor) {
      setHasPassword(null);
      return;
    }
    try {
      const opts = await checkEmailLoginOptions(normalized);
      setHasPassword(opts.hasPassword ?? false);
      if (opts.hasPassword) {
        setLoginMode('password');
      }
    } catch {
      setHasPassword(null);
    }
  };

  const handleMagicLink = async () => {
    if (!normalizedEmail.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }

    if (!isVisitor && !(await isRegisteredMemberEmail(normalizedEmail))) {
      setError('This email is not registered yet. Request a membership invite first.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const result = await sendMagicLink(normalizedEmail, { allowVisitor: isVisitor });
      if (result.demoLink) {
        setDemoLink(result.demoLink);
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send email. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!normalizedEmail.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Enter your password.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await loginWithPassword(normalizedEmail, password);
      const session = await resolveSessionFromEmailAsync(normalizedEmail);
      if (isStaffRole(session.role)) {
        session.viewMode = 'staff';
      }
      setSession(session);
      router.replace(getPostLoginRoute(session.role, session.viewMode));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell subtitle={isVisitor ? 'Visitor sign in' : 'Sign in'}>
      <CkcCard>
        {sent ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ckc-gold/20">
              <span className="text-xl">✉</span>
            </div>
            <h2 className="text-base font-semibold text-ckc-white">Check your email</h2>
            <p className="text-xs leading-relaxed text-ckc-muted">
              We sent a sign-in link to <strong className="text-ckc-white">{normalizedEmail}</strong>.
              Tap the link in that email to continue.
            </p>
            {demoLink && (
              <p className="text-xs text-amber-400/90">
                Demo mode:{' '}
                <Link href={demoLink} className="underline">
                  use this test link
                </Link>
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setDemoLink('');
              }}
              className="text-xs text-ckc-muted hover:text-ckc-gold"
            >
              Back
            </button>
          </div>
        ) : isVisitor || loginMode === 'magic' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleMagicLink();
            }}
            className="space-y-4"
          >
            <h2 className="text-base font-semibold text-ckc-white">
              {isVisitor ? 'Continue as visitor' : 'Email sign-in link'}
            </h2>
            <p className="text-xs text-ckc-muted">
              Enter your email and we&apos;ll send a one-click sign-in link.
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
              {loading ? 'Sending…' : 'Email me a sign-in link'}
            </CkcButton>

            {!isVisitor && (
              <button
                type="button"
                onClick={() => {
                  setLoginMode('password');
                  setError('');
                }}
                className="w-full text-xs text-ckc-muted hover:text-ckc-gold"
              >
                Sign in with password instead
              </button>
            )}
          </form>
        ) : (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <h2 className="text-base font-semibold text-ckc-white">Welcome back</h2>
            <p className="text-xs text-ckc-muted">
              Sign in with the email and password you set when you joined.
            </p>

            <CkcField label="Email address" required>
              <CkcInput
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  void refreshLoginOptions(e.target.value);
                }}
                onBlur={() => void refreshLoginOptions(email)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </CkcField>

            <CkcField label="Password" required>
              <CkcInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </CkcField>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <CkcButton type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </CkcButton>

            {hasPassword === false && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('magic');
                    setError('');
                  }}
                  className="w-full text-xs text-ckc-gold hover:underline"
                >
                  No password yet? Use email sign-in link (one time — then set a password)
                </button>
              </>
            )}
          </form>
        )}
      </CkcCard>

      <div className="mt-6 space-y-2 text-center text-sm">
        {!isVisitor && (
          <Link href="/request-invite" className="block text-ckc-gold hover:underline">
            New here? Request membership →
          </Link>
        )}
        {!isVisitor ? (
          <Link href="/login?mode=visitor" className="block text-ckc-muted hover:text-ckc-gold">
            Just visiting? Continue as visitor →
          </Link>
        ) : (
          <Link href="/login" className="block text-ckc-muted hover:text-ckc-gold">
            Member or staff? Sign in here →
          </Link>
        )}
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ckc-black" />}>
      <LoginForm />
    </Suspense>
  );
}
