'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthShell from '@/components/auth/AuthShell';
import OtpInput from '@/components/auth/OtpInput';
import { CkcButton, CkcCard, CkcField, CkcInput } from '@/components/ui/CkcForm';
import { sendOtp, verifyOtp, getStoredOtpForDemo } from '@/lib/auth/otp';
import {
  formatPhoneDisplay,
  getPostLoginRoute,
  isRegisteredMemberPhone,
  normalizePhone,
  resolveSessionFromPhone,
  setSession,
} from '@/lib/auth/session';
import { DEMO_LOGIN_HINTS } from '@/lib/auth/demo-users';
import { BRAND } from '@/lib/assets';

type Step = 'phone' | 'otp';
type LoginMode = 'member' | 'visitor';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'visitor' ? 'visitor' : 'member';

  const [loginMode, setLoginMode] = useState<LoginMode>(initialMode);
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoCode, setDemoCode] = useState<string | null>(null);

  const switchMode = (mode: LoginMode) => {
    setLoginMode(mode);
    setStep('phone');
    setOtp('');
    setError('');
    setDemoCode(null);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizePhone(phone);
    if (normalized.length < 9) {
      setError('Please enter a valid cell number.');
      return;
    }

    if (loginMode === 'member' && !isRegisteredMemberPhone(phone)) {
      setError('This number is not registered. Ask your church admin for an invite, or continue as a visitor.');
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

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Enter the 6-digit code.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (!verifyOtp(phone, otp)) {
        setError('Invalid or expired code. Please try again.');
        setLoading(false);
        return;
      }

      const session = resolveSessionFromPhone(phone, {
        asVisitor: loginMode === 'visitor',
      });
      setSession(session);
      router.push(getPostLoginRoute(session.role, session.viewMode));
    }, 600);
  };

  const isVisitor = loginMode === 'visitor';

  return (
    <AuthShell subtitle="Sign in with your cell number">
      <div className="mb-4 flex rounded-lg border border-white/10 bg-ckc-elevated p-1">
        <button
          type="button"
          onClick={() => switchMode('member')}
          className={`flex-1 rounded-md py-2 text-xs font-semibold transition-colors ${
            !isVisitor ? 'bg-ckc-gold/20 text-ckc-gold' : 'text-ckc-muted hover:text-ckc-white'
          }`}
        >
          Member
        </button>
        <button
          type="button"
          onClick={() => switchMode('visitor')}
          className={`flex-1 rounded-md py-2 text-xs font-semibold transition-colors ${
            isVisitor ? 'bg-ckc-gold/20 text-ckc-gold' : 'text-ckc-muted hover:text-ckc-white'
          }`}
        >
          Visitor
        </button>
      </div>

      <CkcCard>
        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <h2 className="mb-1 text-base font-semibold text-ckc-white">
              {isVisitor ? 'Visitor' : 'Welcome back'}
            </h2>
            <p className="mb-4 text-xs text-ckc-muted">
              {isVisitor
                ? 'Sign in with your cell number to explore church resources.'
                : 'Enter your registered cell number. A one-time code is sent every time you sign in.'}
            </p>

            <CkcField label="Cell number" required>
              <CkcInput
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="073 550 2014"
                autoComplete="tel"
              />
            </CkcField>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <CkcButton type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send OTP'}
            </CkcButton>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <h2 className="mb-1 text-base font-semibold text-ckc-white">Enter verification code</h2>
            <p className="mb-2 text-xs text-ckc-muted">
              Code sent to {formatPhoneDisplay(phone)}
            </p>

            {demoCode && (
              <p className="rounded-lg border border-ckc-gold/20 bg-ckc-gold/5 px-3 py-2 text-xs text-ckc-gold">
                Demo mode — your code is: <strong>{demoCode}</strong>
              </p>
            )}

            <OtpInput value={otp} onChange={setOtp} />

            {error && <p className="text-center text-xs text-red-400">{error}</p>}

            <CkcButton type="submit" disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying…' : isVisitor ? 'Continue' : 'Sign In'}
            </CkcButton>

            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setOtp('');
                setError('');
                setDemoCode(getStoredOtpForDemo(phone));
              }}
              className="w-full text-xs text-ckc-muted hover:text-ckc-gold"
            >
              Change number
            </button>
          </form>
        )}
      </CkcCard>

      <div className="mt-6 space-y-3 text-center">
        {!isVisitor && (
          <Link href="/request-invite" className="block text-sm text-ckc-gold hover:underline">
            New here? Request a membership invite →
          </Link>
        )}
        {!isVisitor && (
          <button
            type="button"
            onClick={() => switchMode('visitor')}
            className="block w-full text-sm text-ckc-muted hover:text-ckc-gold transition-colors"
          >
            Continue as Visitor →
          </button>
        )}
        {isVisitor && (
          <button
            type="button"
            onClick={() => switchMode('member')}
            className="block w-full text-sm text-ckc-gold hover:underline"
          >
            ← Back to member sign in
          </button>
        )}
        <p className="text-xs text-ckc-dim">
          Need help? Call {BRAND.supportPhone}
        </p>
        {!isVisitor && (
          <div className="rounded-lg border border-white/5 bg-ckc-elevated p-3 text-left">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-ckc-gold">Demo test accounts</p>
            <ul className="space-y-1 text-[11px] text-ckc-muted">
              {DEMO_LOGIN_HINTS.filter((h) => h.role !== 'Visitor').map((h) => (
                <li key={h.phone}>
                  <span className="text-ckc-white">{h.phone}</span> — {h.role}
                </li>
              ))}
              <li>
                <span className="text-ckc-white">Any other number</span> — use Visitor tab
              </li>
            </ul>
          </div>
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
