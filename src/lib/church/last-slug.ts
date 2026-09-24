const LAST_CHURCH_SLUG_KEY = 'ckc_last_church_slug';

export function rememberChurchSlug(slug: string): void {
  if (typeof window === 'undefined') return;
  const value = slug.trim();
  if (!value) return;
  localStorage.setItem(LAST_CHURCH_SLUG_KEY, value);
}

export function readLastChurchSlug(): string | null {
  if (typeof window === 'undefined') return null;
  const value = localStorage.getItem(LAST_CHURCH_SLUG_KEY)?.trim();
  return value || null;
}
