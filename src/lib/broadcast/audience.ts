import type { CampusId } from '@/lib/church/constants';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSuperAdminEmail, isInternalPlaceholderPhone } from '@/lib/auth/super-admin';

export type BroadcastAudienceType = 'members' | 'group';

export interface BroadcastFilters {
  audienceType: BroadcastAudienceType;
  campusId?: CampusId | 'all';
  gender?: 'Male' | 'Female' | 'all';
  ageCategory?: 'child' | 'youth' | 'adult' | 'all';
  groupId?: string;
}

export interface BroadcastRecipient {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  campus: string;
}

function ageCategoryToRange(category: string): { min?: number; max?: number } {
  if (category === 'child') return { max: 12 };
  if (category === 'youth') return { min: 13, max: 25 };
  if (category === 'adult') return { min: 26 };
  return {};
}

/** Super-admin login email and internal phones must never receive church broadcasts. */
function isExcludedBroadcastRecipient(phone: string, email: string | null): boolean {
  if (isInternalPlaceholderPhone(phone)) return true;
  const superAdminEmail = getSuperAdminEmail();
  if (email && email.trim().toLowerCase() === superAdminEmail) return true;
  return false;
}

function filterBroadcastRecipients(rows: {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  campus_id: string;
}[]): BroadcastRecipient[] {
  return rows
    .filter((m) => !isExcludedBroadcastRecipient(m.phone, m.email))
    .map((m) => ({
      id: m.id,
      name: m.full_name,
      phone: m.phone,
      email: m.email,
      campus: m.campus_id,
    }));
}

export async function resolveBroadcastAudience(
  db: SupabaseClient,
  filters: BroadcastFilters,
): Promise<BroadcastRecipient[]> {
  if (filters.audienceType === 'group' && filters.groupId) {
    const { data: groupMembers, error: gmError } = await db
      .from('group_members')
      .select('member_phone')
      .eq('group_id', filters.groupId);

    if (gmError) throw new Error(gmError.message);

    const phones = (groupMembers ?? []).map((m) => m.member_phone).filter(Boolean);
    if (phones.length === 0) return [];

    const { data: members, error } = await db
      .from('members')
      .select('id, full_name, phone, email, campus_id, gender, age, status')
      .eq('status', 'active')
      .in('phone', phones);

    if (error) throw new Error(error.message);

    const leaderRow = await db
      .from('groups')
      .select('leader_phone, leader_name')
      .eq('id', filters.groupId)
      .maybeSingle();

    const rows = members ?? [];
    if (leaderRow.data?.leader_phone && !rows.some((m) => m.phone === leaderRow.data!.leader_phone)) {
      rows.push({
        id: `leader-${filters.groupId}`,
        full_name: leaderRow.data.leader_name,
        phone: leaderRow.data.leader_phone,
        email: null,
        campus_id: '',
        gender: null,
        age: null,
        status: 'active',
      });
    }

    return filterBroadcastRecipients(rows);
  }

  let query = db
    .from('members')
    .select('id, full_name, phone, email, campus_id, gender, age, status')
    .eq('status', 'active');

  if (filters.campusId && filters.campusId !== 'all') {
    query = query.eq('campus_id', filters.campusId);
  }
  if (filters.gender && filters.gender !== 'all') {
    query = query.eq('gender', filters.gender);
  }
  if (filters.ageCategory && filters.ageCategory !== 'all') {
    const { min, max } = ageCategoryToRange(filters.ageCategory);
    if (min != null) query = query.gte('age', min);
    if (max != null) query = query.lte('age', max);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return filterBroadcastRecipients(data ?? []);
}
