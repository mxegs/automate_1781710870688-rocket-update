'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AuthShell from '@/components/auth/AuthShell';
import { CkcButton, CkcCard } from '@/components/ui/CkcForm';
import { resolveCurrentChurch, type ResolvedChurch } from '@/lib/church/resolve-from-url';

export default function SignupSuccessPage() {
  const [church, setChurch] = useState<ResolvedChurch | null>(null);

  useEffect(() => {
    resolveCurrentChurch().then(setChurch);
  }, []);

  const name = church?.name || 'your church';

  return (
    <AuthShell showLogo={false} title={church?.name || 'Welcome'}>
      <CkcCard className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center">
          {church?.logoUrl ? (
            <Image src={church.logoUrl} alt={name} width={80} height={80} className="object-contain" />
          ) : (
            <p className="font-serif text-lg font-semibold text-ckc-black">{name}</p>
          )}
        </div>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ckc-gold/10">
          <span className="text-2xl text-ckc-gold">✓</span>
        </div>
        <h2 className="ckc-gradient-title mb-2 text-xl font-bold">Thank you!</h2>
        <p className="mb-6 text-sm leading-relaxed text-ckc-muted">
          Your membership registration has been received. We will email and SMS you when your
          application is approved, with instructions to sign in using the password you just saved.
        </p>
        <Link href={church?.slug ? `/${church.slug}/login` : '/login'}>
          <CkcButton type="button" variant="ghost">Close</CkcButton>
        </Link>
      </CkcCard>
    </AuthShell>
  );
}
