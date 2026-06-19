'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AuthShell from '@/components/auth/AuthShell';
import OtpInput from '@/components/auth/OtpInput';
import { CkcButton, CkcCard, CkcField, CkcInput } from '@/components/ui/CkcForm';
import { sendOtp, verifyOtp, getStoredOtpForDemo } from '@/lib/auth/otp';
import { formatPhoneDisplay, normalizePhone, setInviteSession } from '@/lib/auth/session';
import { findInviteByToken } from '@/lib/invites/service';
import { BRAND } from '@/lib/assets';

type Step = 'welcome' | 'otp';

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = (params?.token as string) || '';
  const [step, setStep] = useState<Step>('welcome');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [inviteMeta, setInviteMeta] = useState<Awaited<ReturnType<typeof findInviteByToken>>>(null);

  useEffect(() => {
    findInviteByToken(token).then(setInviteMeta);
  }, [token]);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (normalizePhone(phone).length < 9) {
      setError('Please enter a valid cell number.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      const code = sendOtp(phone);
      setDemoCode(code);
      setStep('otp');
      setLoading(false);
    }, 600);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Enter the 6-digit code.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (!verifyOtp(phone, otp)) {
        setError('Invalid or expired code.');
        setLoading(false);
        return;
      }
      setInviteSession({
        phone: normalizePhone(phone),
        token,
        officialName: inviteMeta?.officialName,
        username: inviteMeta?.username,
      });
      router.push('/signup/complete');
    }, 600);
  };

  return (
    <AuthShell subtitle="Membership registration invite">
      <CkcCard>
        {step === 'welcome' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <span className="ckc-label-pill">Invite received</span>
            <h2 className="text-base font-semibold text-ckc-white">
              {inviteMeta ? `Welcome, ${inviteMeta.officialName.split(' ')[0]}` : 'Complete your membership'}
            </h2>
            <p className="text-xs leading-relaxed text-ckc-muted">
              You&apos;ve been invited to join {BRAND.name}. Confirm your cell number to begin registration.
              {inviteMeta?.username && (
                <span className="mt-1 block text-ckc-dim">Suggested username: {inviteMeta.username}</span>
              )}
            </p>

            <CkcField label="Cell number" required>
              <CkcInput
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="073 550 2014"
              />
            </CkcField>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <CkcButton type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send OTP'}
            </CkcButton>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <h2 className="text-base font-semibold text-ckc-white">Verify your number</h2>
            <p className="text-xs text-ckc-muted">Code sent to {formatPhoneDisplay(phone)}</p>

            {demoCode && (
              <p className="rounded-lg border border-ckc-gold/20 bg-ckc-gold/5 px-3 py-2 text-xs text-ckc-gold">
                Demo mode — your code is: <strong>{demoCode}</strong>
              </p>
            )}

            <OtpInput value={otp} onChange={setOtp} />
            {error && <p className="text-center text-xs text-red-400">{error}</p>}

            <CkcButton type="submit" disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying…' : 'Continue to Form'}
            </CkcButton>
          </form>
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
