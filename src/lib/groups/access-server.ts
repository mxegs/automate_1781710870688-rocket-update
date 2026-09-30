import type { SupabaseClient } from '@supabase/supabase-js';
import { normalizePhone } from '@/lib/auth/session';
import type { StaffActor } from '@/lib/auth/staff-access-server';
import { canUsePastoralStaffTools } from '@/lib/auth/staff-access-server';

export async function visibleGroupIdsForSession(
  db: SupabaseClient,
  churchId: string,
  actor: StaffActor | null,
  phone: string | null | undefined,
): Promise<'all' | string[]> {
  if (actor && canUsePastoralStaffTools(actor)) return 'all';

  const digits = phone ? normalizePhone(phone) : '';
  if (!digits) return [];

  if (actor?.dbRole === 'leader') {
    const { data } = await db.from('groups').select('id, leader_phone').eq('church_id', churchId);
    return (data ?? [])
      .filter((row) => normalizePhone(String(row.leader_phone ?? '')) === digits)
      .map((row) => row.id as string);
  }

  const { data: groups } = await db.from('groups').select('id').eq('church_id', churchId);
  const churchGroupIds = new Set((groups ?? []).map((row) => row.id as string));
  if (churchGroupIds.size === 0) return [];

  const { data: memberships } = await db.from('group_members').select('group_id, member_phone');
  return [...new Set(
    (memberships ?? [])
      .filter(
        (row) =>
          churchGroupIds.has(row.group_id as string) &&
          normalizePhone(String(row.member_phone ?? '')) === digits,
      )
      .map((row) => row.group_id as string),
  )];
}
