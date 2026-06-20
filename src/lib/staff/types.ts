import type { CampusId } from '@/lib/church/constants';

export type AssignableStaffRole =
  | 'admin'
  | 'pastor'
  | 'leader'
  | 'senior_pastor'
  | 'administrative_manager';

export interface StaffProfile {
  id: string;
  email: string;
  phone: string;
  role: AssignableStaffRole | 'super_admin';
  campusId: CampusId | null;
  displayName: string;
  officialName: string;
  username: string | null;
  createdAt: string;
}

export interface AssignStaffInput {
  email: string;
  displayName: string;
  officialName?: string;
  campusId?: CampusId | null;
  role: AssignableStaffRole;
}
