'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { APP_NAME } from '@/lib/assets';
import { extractChurchSlug, resolveCurrentChurch, type ResolvedChurch } from '@/lib/church/resolve-from-url';
import { rememberChurchBranding, rememberChurchSlug, readLastChurchSlug } from '@/lib/church/last-slug';
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

  useEffect(() => {
    if (isVisitor) {
      router.replace('/member/church-info');
    }
  }, [isVisitor, router]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [demoLink, setDemoLink] = useState('');
  const [loginMode, setLoginMode] = useState<'password' | 'magic'>('password');
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [church, setChurch] = useState<ResolvedChurch | null>(null);
  const [gate, setGate] = useState<'checking' | 'neutral' | 'ready'>('checking');

  useEffect(() => {
    let cancelled = false;
    const pathSlug = extractChurchSlug(window.location.pathname);
    if (!pathSlug) {
      const stored = readLastChurchSlug();
      if (stored) {
        router.replace(`/${stored}/login${window.location.search}`);
        return;
      }
      setGate('neutral');
      document.documentElement.style.setProperty('--ckc-primary', '#6B7280');
      document.documentElement.style.setProperty('--ckc-secondary', '#F7F3EE');
      return;
    }
    resolveCurrentChurch().then((found) => {
      if (cancelled) return;
      if (!found) {
        setGate('neutral');
        return;
      }
      setChurch(found);
      rememberChurchSlug(found.slug);
      rememberChurchBranding({
        primaryColor: found.primaryColor || '#6B7280',
        secondaryColor: found.secondaryColor || '#F7F3EE',
      });
      document.documentElement.style.setProperty('--ckc-primary', found.primaryColor || '#6B7280');
      document.documentElement.style.setProperty('--ckc-secondary', found.secondaryColor || '#F7F3EE');
      setGate('ready');
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

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

    if (!isVisitor) {
      try {
        const opts = await checkEmailLoginOptions(normalizedEmail);
        if (opts.suspended) {
          setError(opts.message || 'This membership is suspended. Contact your campus admin.');
          return;
        }
        if (!opts.registered) {
          setError(
            opts.message ||
              (opts.pendingInvite
                ? 'You have a pending invite. Open the invite link from your email to finish joining — then you can sign in here.'
                : 'This email is not registered yet. Request a membership invite first.'),
          );
          return;
        }
      } catch {
        if (!(await isRegisteredMemberEmail(normalizedEmail))) {
          setError('This email is not registered yet. Request a membership invite first.');
          return;
        }
      }
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
      const next = getPostLoginRoute(session.role, session.viewMode);
      const slug = church?.slug || extractChurchSlug(window.location.pathname);
      router.replace(slug ? `/${slug}${next}` : next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    'w-full rounded-2xl bg-[#F3F4F6] py-3.5 pl-11 pr-4 text-[15px] text-ckc-black placeholder:text-[#9CA3AF] outline-none ring-0 focus:bg-[#EEEFF2]';

  if (gate === 'checking') {
    return <div className="min-h-dvh bg-white" />;
  }

  if (gate === 'neutral') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center">
        <p className="font-serif text-3xl font-semibold text-neutral-900">{APP_NAME}</p>
        <h6 className="mt-6 max-w-sm font-bold text-neutral-800">
          Welcome. Please use the link your church sent you to sign in.
        </h6>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col px-6 pb-8 pt-10">
        <div className="text-center">
          {church?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={church.logoUrl} alt={church.name} className="mx-auto h-auto w-[190px] object-contain" />
          ) : (
            <p className="font-serif text-3xl font-semibold text-ckc-black">{church?.name}</p>
          )}
          <h6 className="mt-6 font-bold text-ckc-black">Welcome to {church?.name}, sign in now</h6>
        </div>

        <div className="mt-8 flex flex-1 flex-col">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F3F4F6]">
                <Icon name="EnvelopeIcon" size={22} variant="outline" className="text-ckc-gold-dim" />
              </div>
              <h2 className="text-xl font-bold text-ckc-black">Check your email</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                We sent a sign-in link to <strong className="text-ckc-black">{normalizedEmail}</strong>. Tap the
                link in that email to continue.
              </p>
              {demoLink ? (
                <p className="mt-3 text-sm text-ckc-gold-dim">
                  Demo mode:{' '}
                  <Link href={demoLink} className="font-semibold underline">
                    use this test link
                  </Link>
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setDemoLink('');
                }}
                className="mt-6 text-sm font-medium text-[#6B7280]"
              >
                Back
              </button>
            </div>
          ) : loginMode === 'magic' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleMagicLink();
              }}
              className="flex flex-1 flex-col"
            >
              <div className="relative">
                <Icon
                  name="EnvelopeIcon"
                  size={18}
                  variant="outline"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="email"
                  className={fieldClass}
                />
              </div>

              {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="mt-5 w-full rounded-2xl bg-ckc-black py-3.5 text-[15px] font-semibold text-white disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Email me a sign-in link'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginMode('password');
                  setError('');
                }}
                className="mt-4 text-center text-sm font-medium text-[#6B7280]"
              >
                Sign in with password instead
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordLogin} className="flex flex-1 flex-col">
              <div className="relative">
                <Icon
                  name="UserIcon"
                  size={18}
                  variant="outline"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    void refreshLoginOptions(e.target.value);
                  }}
                  onBlur={() => void refreshLoginOptions(email)}
                  placeholder="Email"
                  autoComplete="email"
                  className={fieldClass}
                />
              </div>

              <div className="relative mt-3">
                <Icon
                  name="LockClosedIcon"
                  size={18}
                  variant="outline"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  className={`${fieldClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={18} variant="outline" />
                </button>
              </div>

              {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="mt-5 w-full rounded-2xl bg-ckc-gold py-3.5 text-[15px] font-semibold text-[#000000] disabled:opacity-50"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>

              <div className="mt-4 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('magic');
                    setError('');
                  }}
                  className="text-sm font-medium text-[#6B7280]"
                >
                  Magic link sign in
                </button>
                <Link href="/forgot-password" className="text-sm text-[#9CA3AF]">
                  Forgot password?
                </Link>
              </div>

              {hasPassword === false ? (
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('magic');
                    setError('');
                  }}
                  className="mt-3 text-center text-sm font-medium text-ckc-gold-dim"
                >
                  No password yet? Use email sign-in link
                </button>
              ) : null}
            </form>
          )}
        </div>

        <div className="mt-auto pt-8 text-center">
          <p className="text-sm text-[#6B7280]">
            No account yet?{' '}
            <Link href="/request-invite" className="font-semibold text-ckc-gold-dim">
              Create one
            </Link>
          </p>
          <Link href="/member/church-info" className="mt-3 block text-sm text-[#9CA3AF]">
            Just visiting? Learn about the church
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginForm />
    </Suspense>
  );
}
