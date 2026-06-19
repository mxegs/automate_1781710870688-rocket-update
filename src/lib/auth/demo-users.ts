import type { UserRole } from './session';

export interface DemoUser {
  phone: string;
  role: UserRole;
  officialName: string;
  username: string;
  displayName: string;
}

/** Demo accounts for testing portals — replace with Supabase lookup in production */
export const DEMO_USERS: DemoUser[] = [
  {
    phone: '735502014',
    role: 'admin',
    officialName: 'James Mokoena',
    username: 'pastor_james',
    displayName: 'Pastor James',
  },
  {
    phone: '735502015',
    role: 'pastor',
    officialName: 'Sarah Ndlovu',
    username: 'pastor_sarah',
    displayName: 'Pastor Sarah',
  },
  {
    phone: '735502016',
    role: 'leader',
    officialName: 'David Khumalo',
    username: 'david_k',
    displayName: 'David',
  },
  {
    phone: '821112222',
    role: 'member',
    officialName: 'Thabo Mokoena',
    username: 'thabo',
    displayName: 'Thabo',
  },
  {
    phone: '821113333',
    role: 'member',
    officialName: 'Nomsa Dlamini-Zulu',
    username: 'nomsa',
    displayName: 'Nomsa',
  },
];

export function findDemoUser(phone: string): DemoUser | null {
  const normalized = phone.replace(/\D/g, '');
  const match = normalized.slice(-9);
  return (
    DEMO_USERS.find(
      (u) =>
        u.phone === normalized ||
        u.phone === match ||
        normalized.endsWith(u.phone),
    ) ?? null
  );
}

export interface DemoInvite {
  token: string;
  phone: string;
  officialName: string;
  username?: string;
}

export const DEMO_INVITES: DemoInvite[] = [
  {
    token: 'demo',
    phone: '821114444',
    officialName: 'Lerato Mthembu',
    username: 'lerato',
  },
];

export function findDemoInvite(token: string): DemoInvite | null {
  return DEMO_INVITES.find((i) => i.token === token) ?? null;
}

export const DEMO_LOGIN_HINTS = [
  { phone: '073 550 2014', role: 'Admin' },
  { phone: '073 550 2015', role: 'Pastor' },
  { phone: '073 550 2016', role: 'Ministry Leader' },
  { phone: '082 111 2222', role: 'Member' },
];
