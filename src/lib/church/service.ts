import { apiFetch } from '@/lib/api/client';
import { resolveChurchId } from '@/lib/church/tenant';

export interface ChurchRecord {
  id: string;
  name: string;
  slug: string;
  primaryColor: string | null;
  secondaryColor: string | null;
  logoUrl: string | null;
  appName: string | null;
}

export interface ChurchBranding {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
  appName: string | null;
}

const NEUTRAL_BRANDING: ChurchBranding = {
  name: '',
  primaryColor: '#6B7280',
  secondaryColor: '#F7F3EE',
  logoUrl: null,
  appName: null,
};

export async function getChurch(churchId?: string | null): Promise<ChurchRecord | null> {
  const id = resolveChurchId(churchId);
  if (!id) return null;
  return apiFetch<ChurchRecord>(`/api/churches/${id}`);
}

export async function getChurchBranding(churchId?: string | null): Promise<ChurchBranding> {
  try {
    const church = await getChurch(churchId);
    if (!church) return NEUTRAL_BRANDING;
    return {
      name: church.name,
      primaryColor: church.primaryColor || NEUTRAL_BRANDING.primaryColor,
      secondaryColor: church.secondaryColor || NEUTRAL_BRANDING.secondaryColor,
      logoUrl: church.logoUrl,
      appName: church.appName,
    };
  } catch {
    return NEUTRAL_BRANDING;
  }
}
