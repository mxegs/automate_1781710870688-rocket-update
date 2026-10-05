'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { APP_NAME } from '@/lib/assets';
import { extractChurchSlug, getChurchBySlug, type ResolvedChurch } from '@/lib/church/resolve-from-url';
import { rememberChurchBranding, rememberChurchSlug } from '@/lib/church/last-slug';

export default function WelcomePage() {
  const [church, setChurch] = useState<ResolvedChurch | null>(null);
  const [ready, setReady] = useState(false);
  const [pathSlug, setPathSlug] = useState<string | null>(null);

  useEffect(() => {
    const slug = extractChurchSlug(window.location.pathname);
    setPathSlug(slug);
    if (getSession()) {
      window.location.replace(slug ? `/${slug}/member` : '/member');
      return;
    }

    let cancelled = false;
    const load = slug ? getChurchBySlug(slug) : Promise.resolve(null);
    load.then((found) => {
      if (cancelled) return;
      if (found) {
        setChurch(found);
        rememberChurchSlug(found.slug);
        rememberChurchBranding({
          primaryColor: found.primaryColor || '#6B7280',
          secondaryColor: found.secondaryColor || '#F7F3EE',
        });
        document.documentElement.style.setProperty('--ckc-primary', found.primaryColor || '#6B7280');
        document.documentElement.style.setProperty('--ckc-secondary', found.secondaryColor || '#F7F3EE');
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) return <div className="min-h-dvh bg-ckc-black" />;

  const loginHref = church?.slug || pathSlug ? `/${church?.slug || pathSlug}/login` : '/login';
  const name = church?.name || APP_NAME;

  return (
    <div className="flex min-h-dvh flex-col bg-ckc-black">
      {church?.heroUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={church.heroUrl} alt="" className="h-40 w-full object-cover" />
      ) : null}
      <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col px-6 py-10">
        <div className="text-center">
          {church?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={church.logoUrl} alt={name} className="mx-auto h-auto w-[160px] object-contain" />
          ) : (
            <p className="font-serif text-3xl font-semibold text-cloud">{name}</p>
          )}
          {church?.name && church.logoUrl ? (
            <p className="mt-4 font-serif text-2xl font-semibold text-cloud">{church.name}</p>
          ) : null}
          {church?.tagline ? <p className="mt-2 text-sm text-cloud/70">{church.tagline}</p> : null}
          {church?.welcomeMessage ? (
            <p className="mt-4 text-sm leading-relaxed text-cloud/80">{church.welcomeMessage}</p>
          ) : null}
          {!church ? (
            <p className="mt-6 text-sm text-cloud/70">
              Welcome. Please use the link your church sent you to sign in.
            </p>
          ) : null}
        </div>
        <div className="mt-auto flex flex-col gap-3 pt-10">
          <Link
            href={loginHref}
            className="rounded-lg bg-ckc-gold px-4 py-3 text-center text-sm font-semibold text-ckc-black"
          >
            Sign In
          </Link>
          <Link
            href="/member/church-info"
            className="rounded-lg border border-white/20 px-4 py-3 text-center text-sm text-cloud"
          >
            Learn about the church
          </Link>
        </div>
      </div>
    </div>
  );
}
