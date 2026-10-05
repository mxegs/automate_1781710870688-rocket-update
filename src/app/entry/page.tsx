'use client';

import { useEffect } from 'react';
import { getSession } from '@/lib/auth/session';
import { extractChurchSlug } from '@/lib/church/resolve-from-url';
import { hasSeenIntro } from '@/lib/church/intro-seen';

function pathFor(slug: string | null, rest: string): string {
  if (!slug) return rest;
  return `/${slug}${rest}`;
}

export default function ChurchEntryPage() {
  useEffect(() => {
    const slug = extractChurchSlug(window.location.pathname);
    if (getSession()) {
      window.location.replace(pathFor(slug, '/member'));
      return;
    }
    if (slug && hasSeenIntro(slug)) {
      window.location.replace(pathFor(slug, '/welcome'));
      return;
    }
    window.location.replace(pathFor(slug, '/intro'));
  }, []);

  return <div className="min-h-dvh bg-ckc-black" />;
}
