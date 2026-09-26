const LAST_CHURCH_SLUG_KEY = 'ckc_last_church_slug';
const LAST_CHURCH_BRANDING_KEY = 'ckc_last_church_branding';

export function rememberChurchSlug(slug: string): void {
  if (typeof window === 'undefined') return;
  const value = slug.trim();
  if (!value) return;
  localStorage.setItem(LAST_CHURCH_SLUG_KEY, value);
}

export function forgetLastChurch(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LAST_CHURCH_SLUG_KEY);
  localStorage.removeItem(LAST_CHURCH_BRANDING_KEY);
}

export function readLastChurchSlug(): string | null {
  if (typeof window === 'undefined') return null;
  const value = localStorage.getItem(LAST_CHURCH_SLUG_KEY)?.trim();
  return value || null;
}

export function rememberChurchBranding(colors: {
  primaryColor?: string | null;
  secondaryColor?: string | null;
}): void {
  if (typeof window === 'undefined') return;
  const primaryColor = colors.primaryColor?.trim();
  const secondaryColor = colors.secondaryColor?.trim();
  if (!primaryColor || !secondaryColor) return;
  localStorage.setItem(
    LAST_CHURCH_BRANDING_KEY,
    JSON.stringify({ p: primaryColor, s: secondaryColor }),
  );
}

export function readLastChurchBranding(): { primaryColor: string; secondaryColor: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const parsed = JSON.parse(localStorage.getItem(LAST_CHURCH_BRANDING_KEY) || 'null') as {
      p?: string;
      s?: string;
    } | null;
    const primaryColor = parsed?.p?.trim();
    const secondaryColor = parsed?.s?.trim();
    if (!primaryColor || !secondaryColor) return null;
    return { primaryColor, secondaryColor };
  } catch {
    return null;
  }
}

export function applyChurchColors(colors: {
  primaryColor?: string | null;
  secondaryColor?: string | null;
}): void {
  if (typeof document === 'undefined') return;
  const primaryColor = colors.primaryColor?.trim();
  const secondaryColor = colors.secondaryColor?.trim();
  if (primaryColor) document.documentElement.style.setProperty('--ckc-primary', primaryColor);
  if (secondaryColor) document.documentElement.style.setProperty('--ckc-secondary', secondaryColor);
}
