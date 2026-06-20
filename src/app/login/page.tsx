'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AuthShell from '@/components/auth/AuthShell';
import { CkcButton, CkcCard, CkcField, CkcInput } from '@/components/ui/CkcForm';
import { sendMagicLink } from '@/lib/auth/magic-link';
import { isRegisteredMemberEmail, normalizeEmailValue } from '@/lib/auth/session';

function LoginForm() {
  const searchParams = useSearchParams();
  const isVisitor = searchParams.get('mode') === 'visitor';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [demoLink, setDemoLink] = useState('');

  const normalizedEmail = normalizeEmailValue(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
              Tap the link in that email to continue — no code to type.
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
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-base font-semibold text-ckc-white">
              {isVisitor ? 'Continue as visitor' : 'Welcome back'}
            </h2>
            <p className="text-xs text-ckc-muted">
              Enter your email and we&apos;ll send you a one-click sign-in link.
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
          <Link href="/login" className="block text-ckc-gold hover:underline">
            ← Member sign in
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
