export const MEMBER_PHOTO_BUCKET = 'member-photos';
export const MEMBER_PHOTO_MAX_BYTES = 2 * 1024 * 1024;

export const MEMBER_PHOTO_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function memberPhotoPath(churchId: string, memberId: string, ext: string): string {
  return `${churchId}/${memberId}.${ext}`;
}

export function memberPhotoObjectPaths(churchId: string, memberId: string): string[] {
  return ['jpg', 'png', 'webp'].map((ext) => memberPhotoPath(churchId, memberId, ext));
}

export function initialsFromFullName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function avatarToneClass(memberId: string): string {
  const tones = ['bg-ckc-gold text-ckc-black', 'bg-ckc-black text-ckc-gold', 'bg-ckc-gold/20 text-ckc-gold'];
  let h = 0;
  for (let i = 0; i < memberId.length; i += 1) {
    h = (h * 31 + memberId.charCodeAt(i)) >>> 0;
  }
  return tones[h % tones.length];
}

export function directoryPhotoUrl(photoUrl: string | null | undefined, photoVisible: boolean | null | undefined): string | null {
  if (!photoVisible) return null;
  return typeof photoUrl === 'string' && photoUrl ? photoUrl : null;
}
