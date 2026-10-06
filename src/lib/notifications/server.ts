import { churchIdFromUrl } from '@/lib/church/tenant';
import { churchIdForSessionEmail, notFoundResponse, requireSessionChurch } from '@/lib/auth/session-church';
import { readSessionEmailHeader } from '@/lib/auth/staff-access-server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { SupabaseClient } from '@supabase/supabase-js';

export type NotificationType =
  | 'birthday'
  | 'anniversary'
  | 'broadcast'
  | 'prayer'
  | 'group'
  | 'system';

export interface SessionProfile {
  id: string;
  churchId: string;
}

export async function sessionProfileFromRequest(request: Request): Promise<SessionProfile | null> {
  const email = readSessionEmailHeader(request);
  if (!email.includes('@')) return null;

  const requested = churchIdFromUrl(request.url);
  if (requested) {
    const denied = await requireSessionChurch(request, requested);
    if (denied) return null;
  }

  const churchId = requested ?? (await churchIdForSessionEmail(request));
  if (!churchId) return null;

  const db = getSupabaseAdmin();
  if (!db) return null;

  const { data, error } = await db
    .from('profiles')
    .select('id, church_id')
    .ilike('email', email)
    .eq('church_id', churchId)
    .limit(2);

  if (error || !data?.length || data.length > 1) return null;
  const id = (data[0] as { id?: string }).id;
  if (!id) return null;
  return { id, churchId };
}

export function sessionProfileDenied() {
  return notFoundResponse();
}

export async function insertNotifications(
  db: SupabaseClient,
  rows: {
    profileId: string;
    churchId: string;
    type: NotificationType;
    title: string;
    body?: string | null;
    actionUrl?: string | null;
  }[],
): Promise<number> {
  const payload = rows
    .filter((r) => r.profileId && r.churchId)
    .map((r) => ({
      profile_id: r.profileId,
      church_id: r.churchId,
      type: r.type,
      title: r.title,
      body: r.body ?? null,
      action_url: r.actionUrl ?? null,
    }));
  if (!payload.length) return 0;

  const { error, data } = await db.from('notifications').insert(payload).select('id');
  if (error) throw new Error(error.message);
  return data?.length ?? payload.length;
}
