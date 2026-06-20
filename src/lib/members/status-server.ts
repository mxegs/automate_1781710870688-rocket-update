import type { SupabaseClient } from '@supabase/supabase-js';

export type DbMemberStatus = 'active' | 'inactive' | 'suspended';

/** Returns member row status for a profile email, or null if not a member account. */
export async function getMemberStatusForEmail(
  db: SupabaseClient,
  email: string,
): Promise<DbMemberStatus | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes('@')) return null;

  const { data: profile } = await db
    .from('profiles')
    .select('phone, role, email')
    .ilike('email', normalized)
    .maybeSingle();

  if (!profile?.phone) return null;
  if (profile.role !== 'member') return null;

  const { data: member } = await db
    .from('members')
    .select('status')
    .eq('phone', profile.phone)
    .maybeSingle();

  if (!member) return null;
  return member.status as DbMemberStatus;
}

export function isLoginBlockedMemberStatus(status: DbMemberStatus | null): boolean {
  return status === 'suspended' || status === 'inactive';
}
