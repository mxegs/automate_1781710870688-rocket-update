'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';

function ConfirmEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing confirmation token.');
      return;
    }
    let cancelled = false;
    fetch(`/api/me/profile/confirm-email?token=${encodeURIComponent(token)}`, {
      headers: { Accept: 'application/json' },
    })
      .then(async (res) => {
        const json = (await res.json().catch(() => ({}))) as { error?: string; email?: string };
        if (cancelled) return;
        if (!res.ok) {
          setStatus('error');
          setMessage(json.error || 'Could not confirm email');
          return;
        }
        setStatus('ok');
        setMessage('Your email has been confirmed.');
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('error');
          setMessage('Could not confirm email');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="px-5 pb-10 pt-5">
      <h1 className="mb-3 font-serif text-2xl font-semibold text-ckc-black">Confirm email</h1>
      {status === 'loading' ? <p className="text-sm text-ckc-muted">Confirming…</p> : null}
      {status === 'ok' ? <p className="text-sm text-ckc-black">{message}</p> : null}
      {status === 'error' ? <p className="text-sm text-red-700">{message}</p> : null}
      <Link href="/member/profile" className="mt-4 inline-block text-sm text-ckc-gold-dim">
        Back to profile
      </Link>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <AppShell access="shared">
      <Suspense fallback={<p className="px-5 pt-5 text-sm text-ckc-muted">Loading…</p>}>
        <ConfirmEmailInner />
      </Suspense>
    </AppShell>
  );
}
