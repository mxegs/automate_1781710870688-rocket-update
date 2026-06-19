import type { UserRole } from './session';
import type { CampusId } from '@/lib/church/constants';

export interface DemoUser {
  phone: string;
  role: UserRole;
  officialName: string;
  username: string;
  displayName: string;
  campusId: CampusId;
}

/** Offline demo accounts — empty when using Supabase (real members use invites + DB profiles) */
export const DEMO_USERS: DemoUser[] = [];

export function findDemoUser(_phone: string): DemoUser | null {
  return null;
}

export interface DemoInvite {
  token: string;
  phone: string;
  officialName: string;
  username?: string;
}

export const DEMO_INVITES: DemoInvite[] = [];

export function findDemoInvite(_token: string): DemoInvite | null {
  return null;
}

export const DEMO_LOGIN_HINTS: { phone: string; role: string }[] = [];
