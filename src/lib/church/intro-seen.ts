const INTRO_SEEN_PREFIX = 'ckc_seen_intro_';

export function introSeenStorageKey(slug: string): string {
  return `${INTRO_SEEN_PREFIX}${slug.trim().toLowerCase()}`;
}

export function hasSeenIntro(slug: string | null | undefined): boolean {
  if (typeof window === 'undefined') return false;
  const id = slug?.trim().toLowerCase();
  if (!id) return false;
  return window.localStorage.getItem(introSeenStorageKey(id)) === 'true';
}

export function markIntroSeen(slug: string | null | undefined): void {
  if (typeof window === 'undefined') return;
  const id = slug?.trim().toLowerCase();
  if (!id) return;
  window.localStorage.setItem(introSeenStorageKey(id), 'true');
}
