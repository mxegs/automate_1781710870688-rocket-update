'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AuthShell from '@/components/auth/AuthShell';
import { CkcButton, CkcCard } from '@/components/ui/CkcForm';
import { BRAND } from '@/lib/assets';

export default function SignupSuccessPage() {
  return (
    <AuthShell showLogo={false}>
      <CkcCard className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center">
          <Image src={BRAND.logo} alt={BRAND.name} width={80} height={80} className="object-contain" />
        </div>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ckc-gold/10">
          <span className="text-2xl text-ckc-gold">✓</span>
        </div>
        <h2 className="ckc-gradient-title mb-2 text-xl font-bold">Thank you!</h2>
        <p className="mb-6 text-sm leading-relaxed text-ckc-muted">
          Your membership application has been received. Our team will review it and notify you
          once approved.
        </p>
        <p className="mb-6 text-xs text-ckc-dim">
          Questions? Call {BRAND.supportPhone}
        </p>
        <Link href="/login">
          <CkcButton type="button">Return to Sign In</CkcButton>
        </Link>
      </CkcCard>
    </AuthShell>
  );
}
