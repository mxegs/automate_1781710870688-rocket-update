'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CKC_BRANDING, getChurchBranding, type ChurchBranding } from '@/lib/church/service';
import { resolveChurchId } from '@/lib/church/tenant';

const ChurchBrandingContext = createContext<ChurchBranding>(CKC_BRANDING);

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

export default function ChurchBrandingProvider({
  churchId,
  children,
}: {
  churchId?: string;
  children: React.ReactNode;
}) {
  const [branding, setBranding] = useState<ChurchBranding>(CKC_BRANDING);
  const resolvedId = resolveChurchId(churchId);

  useEffect(() => {
    let cancelled = false;
    applyBranding(CKC_BRANDING);
    getChurchBranding(resolvedId).then((next) => {
      if (cancelled) return;
      setBranding(next);
      applyBranding(next);
    });
    return () => {
      cancelled = true;
    };
  }, [resolvedId]);

  return <ChurchBrandingContext.Provider value={branding}>{children}</ChurchBrandingContext.Provider>;
}
