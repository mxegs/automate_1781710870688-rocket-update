'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthShell from '@/components/auth/AuthShell';
import { CkcCard } from '@/components/ui/CkcForm';
import { verifyMagicLink } from '@/lib/auth/magic-link';
import {
  getPostLoginRoute,
  resolveSessionFromEmailAsync,
  setSession,
} from '@/lib/auth/session';

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Missing sign-in link. Request a new one from the login page.');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { email, allowVisitor, needsPassword, setupToken } = await verifyMagicLink(token);
        if (cancelled) return;

        if (needsPassword && setupToken) {
          router.replace(`/account/set-password?token=${encodeURIComponent(setupToken)}`);
          return;
        }

        const session = await resolveSessionFromEmailAsync(email, { asVisitor: allowVisitor });
        setSession(session);
        router.replace(getPostLoginRoute(session.role, session.viewMode));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'This sign-in link is invalid or expired.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, router]);

  return (
    <AuthShell subtitle="Signing you in">
      <CkcCard>
        {error ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-red-400">{error}</p>
            <Link href="/login" className="text-sm text-ckc-gold hover:underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <p className="text-center text-sm text-ckc-muted">One moment…</p>
        )}
      </CkcCard>
    </AuthShell>
  );
}

export default function LoginVerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ckc-black" />}>
      <VerifyForm />
    </Suspense>
  );
}
