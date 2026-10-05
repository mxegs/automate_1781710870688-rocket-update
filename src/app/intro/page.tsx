'use client';

import { useEffect, useState } from 'react';
import { APP_NAME } from '@/lib/assets';
import { extractChurchSlug, getChurchBySlug, type ResolvedChurch } from '@/lib/church/resolve-from-url';
import { rememberChurchBranding, rememberChurchSlug } from '@/lib/church/last-slug';
import { markIntroSeen } from '@/lib/church/intro-seen';

const INTRO_MS = 2500;

export default function IntroPage() {
  const [church, setChurch] = useState<ResolvedChurch | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const slug = extractChurchSlug(window.location.pathname);

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
      timer = window.setTimeout(() => {
        if (cancelled) return;
        markIntroSeen(found?.slug || slug);
        const destSlug = found?.slug || slug;
        window.location.replace(destSlug ? `/${destSlug}/welcome` : '/welcome');
      }, INTRO_MS);
    });

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  if (!ready) return <div className="min-h-dvh bg-ckc-black" />;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ckc-black px-6 text-center">
      {church?.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={church.logoUrl} alt={church.name} className="h-auto w-[190px] object-contain" />
      ) : (
        <p className="font-serif text-3xl font-semibold text-cloud">{church?.name || APP_NAME}</p>
      )}
    </div>
  );
}
