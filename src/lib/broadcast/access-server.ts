import type { BroadcastFilters } from '@/lib/broadcast/audience';
import type { StaffActor } from '@/lib/auth/staff-access-server';
import { actorCampusScope, hasAllCampusStaffAccess } from '@/lib/auth/staff-access-server';
import { isChurchWideDbRole } from '@/lib/auth/church-wide-staff';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Church staff send broadcasts — super admin (app developer) does not. */
export function canSendBroadcast(actor: StaffActor): boolean {
  if (actor.isSuperAdmin) return false;
  return (
    isChurchWideDbRole(actor.dbRole) ||
    actor.dbRole === 'admin' ||
    actor.dbRole === 'pastor' ||
    actor.dbRole === 'leader'
  );
}

export async function enforceBroadcastFilters(
  db: SupabaseClient,
  actor: StaffActor,
  filters: BroadcastFilters,
): Promise<{ filters: BroadcastFilters } | { error: string; status: number }> {
  if (!canSendBroadcast(actor)) {
    return {
      error: 'Broadcast is for church staff only. App developer accounts cannot send messages.',
      status: 403,
    };
  }

  const scoped: BroadcastFilters = { ...filters };

  if (hasAllCampusStaffAccess(actor) && !actor.isSuperAdmin) {
    return { filters: scoped };
  }

  if (actor.dbRole === 'leader') {
    const { data: ledGroups } = await db.from('groups').select('id').eq('leader_phone', actor.phone);
    const ledIds = (ledGroups ?? []).map((g) => g.id);

    if (scoped.audienceType === 'group') {
      if (!scoped.groupId || !ledIds.includes(scoped.groupId)) {
        return { error: 'You can only broadcast to groups you lead.', status: 403 };
      }
    } else {
      const campus = actorCampusScope(actor);
      if (!campus) {
        return {
          error: 'Choose a group audience, or ask an admin to assign your campus.',
          status: 403,
        };
      }
      scoped.campusId = campus;
    }
  } else if (actor.dbRole === 'admin' || actor.dbRole === 'pastor') {
    const campus = actorCampusScope(actor);
    if (!campus) {
      return { error: 'Your account has no campus assigned.', status: 403 };
    }
    if (scoped.audienceType === 'members') {
      scoped.campusId = campus;
    } else if (scoped.audienceType === 'group' && scoped.groupId) {
      const { data: group } = await db
        .from('groups')
        .select('campus_id')
        .eq('id', scoped.groupId)
        .maybeSingle();
      if (!group || group.campus_id !== campus) {
        return { error: 'You can only broadcast to groups on your campus.', status: 403 };
      }
    }
  }

  return { filters: scoped };
}
