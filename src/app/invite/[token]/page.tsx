'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AuthShell from '@/components/auth/AuthShell';
import { CkcButton, CkcCard } from '@/components/ui/CkcForm';
import { normalizeEmailValue, setInviteSession } from '@/lib/auth/session';
import { findInviteByToken } from '@/lib/invites/service';
import { BRAND } from '@/lib/assets';

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = (params?.token as string) || '';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteMeta, setInviteMeta] = useState<Awaited<ReturnType<typeof findInviteByToken>>>(null);

  const inviteEmail = inviteMeta?.email ? normalizeEmailValue(inviteMeta.email) : '';

  useEffect(() => {
    findInviteByToken(token)
      .then((invite) => {
        if (!invite) {
          setError('This invite link is invalid or has already been used.');
          return;
        }
        if (!invite.email) {
          setError('This invite has no email on file. Ask your admin to resend it.');
          return;
        }
        setInviteMeta(invite);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleContinue = () => {
    if (!inviteMeta || !inviteEmail) return;
    setInviteSession({
      phone: inviteMeta.phone ?? '',
      email: inviteEmail,
      token,
      officialName: inviteMeta.officialName,
      username: inviteMeta.username,
    });
    router.push('/signup/complete');
  };

  return (
    <AuthShell subtitle="Membership registration invite">
      <CkcCard>
        {loading ? (
          <p className="text-center text-sm text-ckc-muted">Loading invite…</p>
        ) : error ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-red-400">{error}</p>
            <Link href="/login" className="text-sm text-ckc-gold hover:underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <span className="ckc-label-pill">Invite received</span>
            <h2 className="text-base font-semibold text-ckc-white">
              Welcome, {inviteMeta?.officialName.split(' ')[0]}
            </h2>
            <p className="text-xs leading-relaxed text-ckc-muted">
              You&apos;ve been invited to join {BRAND.name}. Tap below to open the membership form.
              You&apos;ll add your cell number there so the church can send SMS updates.
              {inviteMeta?.username && (
                <span className="mt-1 block text-ckc-dim">Suggested username: {inviteMeta.username}</span>
              )}
            </p>

            <CkcButton type="button" onClick={handleContinue}>
              Start membership form
            </CkcButton>
          </div>
        )}
      </CkcCard>

      <p className="mt-6 text-center text-xs text-ckc-dim">
        Already a member?{' '}
        <Link href="/login" className="text-ckc-gold hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
