import type { CampusId } from '@/lib/church/constants';
import { isSuperAdminEmail, normalizeEmail } from '@/lib/auth/super-admin';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { UserRole as DbUserRole } from '@/lib/supabase/types';

export type StaffDbRole = Extract<DbUserRole, 'super_admin' | 'admin' | 'pastor' | 'leader'>;

export interface StaffActor {
  id: string;
  email: string;
  phone: string;
  dbRole: DbUserRole;
  campusId: CampusId | null;
  isSuperAdmin: boolean;
  displayName: string;
}

export function readStaffEmailHeader(request: Request): string {
  return normalizeEmail(request.headers.get('x-staff-email') ?? '');
}

export async function resolveStaffActor(request: Request): Promise<StaffActor | null> {
  const email = readStaffEmailHeader(request);
  if (!email.includes('@')) return null;

  const db = getSupabaseAdmin();
  if (!db) return null;

  const { data } = await db
    .from('profiles')
    .select('id, email, phone, role, campus_id, display_name, official_name, username')
    .ilike('email', email)
    .maybeSingle();

  if (!data) {
    if (isSuperAdminEmail(email)) {
      return {
        id: 'env-super-admin',
        email,
        phone: 'admin000001',
        dbRole: 'super_admin',
        campusId: null,
        isSuperAdmin: true,
        displayName: 'Tech',
      };
    }
    return null;
  }

  const staffRoles: DbUserRole[] = ['super_admin', 'admin', 'pastor', 'leader'];
  if (!staffRoles.includes(data.role)) return null;

  return {
    id: data.id,
    email: normalizeEmail(data.email ?? email),
    phone: data.phone,
    dbRole: data.role,
    campusId: (data.campus_id as CampusId) ?? null,
    isSuperAdmin: data.role === 'super_admin',
    displayName: data.display_name ?? data.username ?? data.official_name ?? 'Staff',
  };
}

export function actorCampusScope(actor: StaffActor): CampusId | null {
  if (actor.isSuperAdmin) return null;
  return actor.campusId;
}

export function canManageStaffRoles(actor: StaffActor): boolean {
  return actor.isSuperAdmin;
}

export function canManageInvites(actor: StaffActor): boolean {
  return actor.isSuperAdmin || actor.dbRole === 'admin' || actor.dbRole === 'pastor';
}

export function canManageCampus(actor: StaffActor, campusId: CampusId): boolean {
  if (actor.isSuperAdmin) return true;
  if (actor.dbRole === 'admin' || actor.dbRole === 'pastor') {
    return actor.campusId === campusId;
  }
  return false;
}
