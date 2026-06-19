const YOUTUBE_ID_REGEX = /^[\w-]{11}$/;

export function extractYoutubeId(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (YOUTUBE_ID_REGEX.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.slice(1).split('/')[0];
      return YOUTUBE_ID_REGEX.test(id) ? id : null;
    }
    if (url.hostname.includes('youtube.com')) {
      const v = url.searchParams.get('v');
      if (v && YOUTUBE_ID_REGEX.test(v)) return v;
      const embed = url.pathname.match(/\/embed\/([\w-]{11})/);
      if (embed) return embed[1];
    }
  } catch {
    return null;
  }
  return null;
}

export function getThumbnailUrl(item: { youtubeId?: string; externalUrl?: string }): string | null {
  if (item.youtubeId) {
    return `https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg`;
  }
  return null;
}

export function getWatchUrl(item: { youtubeId?: string; externalUrl?: string }): string | null {
  if (item.youtubeId) return `https://www.youtube.com/watch?v=${item.youtubeId}`;
  if (item.externalUrl) return item.externalUrl;
  return null;
}

export function formatPreachedDate(isoDate: string): { display: string; month: string; year: number } {
  const d = new Date(isoDate.includes('T') ? isoDate : `${isoDate}T12:00:00`);
  return {
    display: d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }),
    month: d.toLocaleDateString('en-ZA', { month: 'long' }),
    year: d.getFullYear(),
  };
}

export function visibilityLabel(v: string): string {
  if (v === 'church_wide') return 'All campuses';
  if (v === 'members_only') return 'Members only';
  return 'Campus only';
}
