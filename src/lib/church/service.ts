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

export const CKC_BRANDING: ChurchBranding = {
  name: 'Christ Kingdom Citizens',
  primaryColor: '#C5A073',
  secondaryColor: '#0A0A0A',
  logoUrl: null,
  appName: null,
};

export async function getChurch(churchId?: string): Promise<ChurchRecord> {
  const id = resolveChurchId(churchId);
  return apiFetch<ChurchRecord>(`/api/churches/${id}`);
}

export async function getChurchBranding(churchId?: string): Promise<ChurchBranding> {
  try {
    const church = await getChurch(churchId);
    return {
      name: church.name || CKC_BRANDING.name,
      primaryColor: church.primaryColor || CKC_BRANDING.primaryColor,
      secondaryColor: church.secondaryColor || CKC_BRANDING.secondaryColor,
      logoUrl: church.logoUrl,
      appName: church.appName,
    };
  } catch {
    return CKC_BRANDING;
  }
}
