export interface VisitorEventProfile {
  givenName: string;
  surname: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | '';
  maritalStatus: string;
  acceptedJesus: boolean | null;
  wantsToJoinChurch: boolean | null;
  eventNewsConsent: boolean;
  visitorId?: string;
}

const STORAGE_KEY = 'ckc_visitor_event_profile';

export function getVisitorEventProfile(): VisitorEventProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VisitorEventProfile;
  } catch {
    return null;
  }
}

export function setVisitorEventProfile(profile: VisitorEventProfile): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function hasCompleteVisitorEventProfile(profile: VisitorEventProfile | null): boolean {
  if (!profile) return false;
  return Boolean(
    profile.givenName.trim() &&
      profile.surname.trim() &&
      profile.email.includes('@') &&
      profile.phone.replace(/\D/g, '').length >= 9 &&
      profile.gender &&
      profile.maritalStatus &&
      profile.acceptedJesus !== null &&
      profile.wantsToJoinChurch !== null,
  );
}

export function visitorDisplayName(profile: VisitorEventProfile): string {
  return `${profile.givenName.trim()} ${profile.surname.trim()}`.trim();
}
