'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  extractChurchSlug,
  getChurchBySlug,
  type ResolvedChurch,
} from '@/lib/church/resolve-from-url';
import { getChurchBranding, type ChurchBranding } from '@/lib/church/service';
import { rememberChurchSlug } from '@/lib/church/last-slug';

export const NEUTRAL_BRANDING: ChurchBranding = {
  name: '',
  primaryColor: '#6B7280',
  secondaryColor: '#F7F3EE',
  logoUrl: null,
  appName: null,
};

const ChurchBrandingContext = createContext<ChurchBranding>(NEUTRAL_BRANDING);

export function useChurchBranding(): ChurchBranding {
  return useContext(ChurchBrandingContext);
}

function applyBranding(branding: ChurchBranding) {
  const root = document.documentElement;
  root.style.setProperty('--ckc-primary', branding.primaryColor);
  root.style.setProperty('--ckc-secondary', branding.secondaryColor);
  if (branding.logoUrl) {
    root.style.setProperty('--ckc-logo-url', `url("${branding.logoUrl}")`);
  } else {
    root.style.removeProperty('--ckc-logo-url');
  }
}

function fromResolved(church: ResolvedChurch): ChurchBranding {
  return {
    name: church.name,
    primaryColor: church.primaryColor || NEUTRAL_BRANDING.primaryColor,
    secondaryColor: church.secondaryColor || NEUTRAL_BRANDING.secondaryColor,
    logoUrl: church.logoUrl,
    appName: church.appName,
  };
}

export default function ChurchBrandingProvider({
  churchId,
  slug,
  children,
}: {
  churchId?: string;
  slug?: string;
  children: React.ReactNode;
}) {
  const [branding, setBranding] = useState<ChurchBranding | null>(null);

  useEffect(() => {
    let cancelled = false;
    applyBranding(NEUTRAL_BRANDING);

    const urlSlug = extractChurchSlug(window.location.pathname);
    const targetSlug = slug || urlSlug;

    const load = targetSlug
      ? getChurchBySlug(targetSlug).then((church) => (church ? fromResolved(church) : null))
      : churchId
        ? getChurchBranding(churchId).then((next) => ({
            ...next,
            primaryColor: next.primaryColor || NEUTRAL_BRANDING.primaryColor,
            secondaryColor: next.secondaryColor || NEUTRAL_BRANDING.secondaryColor,
          }))
        : Promise.resolve(null);

    load.then((next) => {
      if (cancelled) return;
      if (!next?.name) {
        setBranding(NEUTRAL_BRANDING);
        applyBranding(NEUTRAL_BRANDING);
        return;
      }
      if (targetSlug) rememberChurchSlug(targetSlug);
      setBranding(next);
      applyBranding(next);
    }).catch(() => {
      if (cancelled) return;
      setBranding(NEUTRAL_BRANDING);
      applyBranding(NEUTRAL_BRANDING);
    });

    return () => {
      cancelled = true;
    };
  }, [churchId, slug]);

  if (!branding) {
    return <div className="min-h-screen bg-white" />;
  }

  return <ChurchBrandingContext.Provider value={branding}>{children}</ChurchBrandingContext.Provider>;
}
