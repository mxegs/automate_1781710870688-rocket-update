'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthShell from '@/components/auth/AuthShell';
import OtpInput from '@/components/auth/OtpInput';
import { CkcButton, CkcCard, CkcField, CkcInput } from '@/components/ui/CkcForm';
import {
  getStoredDeviceTrust,
  registerDeviceTrustAfterOtp,
  tryTrustedDeviceLogin,
} from '@/lib/auth/device-trust';
import { sendEmailOtp, verifyEmailOtp } from '@/lib/auth/email-otp';
import { sendOtp, verifyOtp, getStoredOtpForDemo } from '@/lib/auth/otp';
import {
  formatPhoneDisplay,
  getPostLoginRoute,
  isRegisteredMemberPhone,
  normalizePhone,
  resolveSessionFromEmailAsync,
  resolveSessionFromPhoneAsync,
  setSession,
} from '@/lib/auth/session';

type Step = 'identifier' | 'otp';
type LoginMode = 'member' | 'visitor';
type AuthMethod = 'phone' | 'email';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'visitor' ? 'visitor' : 'member';

  const [loginMode, setLoginMode] = useState<LoginMode>(initialMode);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('phone');
  const [step, setStep] = useState<Step>('identifier');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [checkingDevice, setCheckingDevice] = useState(true);

  const completeLogin = async (
    session: Awaited<ReturnType<typeof resolveSessionFromPhoneAsync>>,
    trust?: { phone?: string; email?: string },
  ) => {
    setSession(session);
    if (trust) {
      await registerDeviceTrustAfterOtp(trust);
    }
    router.push(getPostLoginRoute(session.role, session.viewMode));
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const trust = await tryTrustedDeviceLogin();
      if (cancelled || !trust) {
        setCheckingDevice(false);
        return;
      }
      try {
        if (trust.email) {
          const session = await resolveSessionFromEmailAsync(trust.email);
          setSession(session);
          router.push(getPostLoginRoute(session.role, session.viewMode));
          return;
        }
        if (trust.phone) {
          const session = await resolveSessionFromPhoneAsync(trust.phone, {
            asVisitor: initialMode === 'visitor',
          });
          setSession(session);
          router.push(getPostLoginRoute(session.role, session.viewMode));
        }
      } catch {
        setCheckingDevice(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialMode, router]);

  const switchMode = (mode: LoginMode) => {
    setLoginMode(mode);
    setAuthMethod('phone');
    setStep('identifier');
    setOtp('');
    setError('');
    setDemoCode(null);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (authMethod === 'email') {
      const trimmed = email.trim().toLowerCase();
      if (!trimmed.includes('@')) {
        setError('Enter a valid email address.');
        return;
      }
      setError('');
      setLoading(true);
      try {
        const result = await sendEmailOtp(trimmed);
        setDemoCode(result.demo ? 'check-console' : null);
        setStep('otp');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not send code. Try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    const normalized = normalizePhone(phone);
    if (normalized.length < 9) {
      setError('Please enter a valid cell number.');
      return;
    }

    if (loginMode === 'member' && !(await isRegisteredMemberPhone(phone))) {
      setError('This number is not registered. Ask your church admin for an invite, or continue as a visitor.');
      return;
    }

    const stored = getStoredDeviceTrust();
    if (stored?.phone === normalized) {
      setLoading(true);
      try {
        const trust = await tryTrustedDeviceLogin();
        if (trust?.phone) {
          const session = await resolveSessionFromPhoneAsync(phone, {
            asVisitor: loginMode === 'visitor',
          });
          await completeLogin(session);
          return;
        }
      } finally {
        setLoading(false);
      }
    }

    setError('');
    setLoading(true);
    try {
      const result = await sendOtp(phone);
      setDemoCode(result.demo ? result.code ?? getStoredOtpForDemo(phone) : null);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Enter the 6-digit code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (authMethod === 'email') {
        const trimmed = email.trim().toLowerCase();
        if (!(await verifyEmailOtp(trimmed, otp))) {
          setError('Invalid or expired code. Please try again.');
          return;
        }
        const session = await resolveSessionFromEmailAsync(trimmed);
        await completeLogin(session, { email: trimmed });
        return;
      }

      if (!(await verifyOtp(phone, otp))) {
        setError('Invalid or expired code. Please try again.');
        return;
      }

      const session = await resolveSessionFromPhoneAsync(phone, {
        asVisitor: loginMode === 'visitor',
      });
      await completeLogin(session, { phone: normalizePhone(phone) });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const isVisitor = loginMode === 'visitor';
  const isEmailAdmin = authMethod === 'email';

  if (checkingDevice) {
    return (
      <AuthShell subtitle="Sign in">
        <CkcCard>
          <p className="text-center text-sm text-ckc-muted">Checking this device…</p>
        </CkcCard>
      </AuthShell>
    );
  }

  return (
    <AuthShell subtitle={isEmailAdmin ? 'Super admin email sign-in' : 'Sign in with your cell number'}>
      {!isEmailAdmin && (
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
      )}

      <CkcCard>
        {step === 'identifier' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <h2 className="mb-1 text-base font-semibold text-ckc-white">
              {isEmailAdmin ? 'Admin sign in' : isVisitor ? 'Visitor' : 'Welcome back'}
            </h2>
            <p className="mb-4 text-xs text-ckc-muted">
              {isEmailAdmin
                ? 'Enter your admin email. A one-time code is sent to your inbox.'
                : isVisitor
                  ? 'Sign in with your cell number to explore church resources.'
                  : 'Enter your cell number. SMS is only sent the first time on this device — after that you sign in automatically.'}
            </p>

            {isEmailAdmin ? (
              <CkcField label="Email address" required>
                <CkcInput
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </CkcField>
            ) : (
              <CkcField label="Cell number" required>
                <CkcInput
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="082 000 0000"
                  autoComplete="tel"
                />
              </CkcField>
            )}

            {error && <p className="text-xs text-red-400">{error}</p>}

            <CkcButton type="submit" disabled={loading}>
              {loading ? 'Please wait…' : 'Continue'}
            </CkcButton>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <h2 className="mb-1 text-base font-semibold text-ckc-white">Enter verification code</h2>
            <p className="mb-2 text-xs text-ckc-muted">
              Code sent to {isEmailAdmin ? email.trim().toLowerCase() : formatPhoneDisplay(phone)}
            </p>

            {demoCode && demoCode !== 'check-console' && (
              <p className="rounded-lg border border-ckc-gold/20 bg-ckc-gold/5 px-3 py-2 text-xs text-ckc-gold">
                Demo mode — your code is: <strong>{demoCode}</strong>
              </p>
            )}

            <OtpInput value={otp} onChange={setOtp} />

            {error && <p className="text-center text-xs text-red-400">{error}</p>}

            <CkcButton type="submit" disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying…' : isEmailAdmin || !isVisitor ? 'Sign In' : 'Continue'}
            </CkcButton>

            <button
              type="button"
              onClick={() => {
                setStep('identifier');
                setOtp('');
                setError('');
                setDemoCode(null);
              }}
              className="w-full text-xs text-ckc-muted hover:text-ckc-gold"
            >
              {isEmailAdmin ? 'Change email' : 'Change number'}
            </button>
          </form>
        )}
      </CkcCard>

      <div className="mt-6 space-y-3 text-center">
        {!isEmailAdmin && !isVisitor && (
          <Link href="/request-invite" className="block text-sm text-ckc-gold hover:underline">
            New here? Request a membership invite →
          </Link>
        )}
        {!isEmailAdmin && !isVisitor && (
          <button
            type="button"
            onClick={() => switchMode('visitor')}
            className="block w-full text-sm text-ckc-muted hover:text-ckc-gold transition-colors"
          >
            Continue as Visitor →
          </button>
        )}
        {!isEmailAdmin && isVisitor && (
          <button
            type="button"
            onClick={() => switchMode('member')}
            className="block w-full text-sm text-ckc-gold hover:underline"
          >
            ← Back to member sign in
          </button>
        )}
        {step === 'identifier' && !isVisitor && (
          <button
            type="button"
            onClick={() => {
              setAuthMethod(isEmailAdmin ? 'phone' : 'email');
              setError('');
              setOtp('');
              setDemoCode(null);
            }}
            className="block w-full text-xs text-ckc-dim hover:text-ckc-gold"
          >
            {isEmailAdmin ? '← Back to cell number sign in' : 'Super admin? Sign in with email →'}
          </button>
        )}
        <p className="text-xs text-ckc-dim">
          Need help? Contact your church office
        </p>
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
