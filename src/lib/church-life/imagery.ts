/** Warm photography used across Church Life so screens never render empty grey boxes. */

export const LIFE_PHOTOS = {
  worship: '/assets/life/worship.jpg',
  sanctuary: '/assets/life/sanctuary.jpg',
  gathering: '/assets/life/gathering.jpg',
  prayer: '/assets/life/prayer.jpg',
  bible: '/assets/life/bible.jpg',
  community: '/assets/life/community.jpg',
  lights: '/assets/life/lights.jpg',
  give: '/assets/life/give.jpg',
} as const;

const PHOTO_POOL = Object.values(LIFE_PHOTOS);

export function lifeImageFor(seed: string | number | undefined | null): string {
  const text = String(seed ?? 'ckc');
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return PHOTO_POOL[hash % PHOTO_POOL.length];
}

export function sermonCover(item: { id?: string; youtubeId?: string; title?: string }): string {
  if (item.youtubeId) {
    return `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`;
  }
  return lifeImageFor(item.id || item.title || 'sermon');
}

export function eventCover(item: { id?: string; imageUrl?: string; title?: string }): string {
  if (item.imageUrl) return item.imageUrl;
  return lifeImageFor(item.id || item.title || 'event');
}
