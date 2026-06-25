import { NextResponse } from 'next/server';
import { syncAllMemberProfiles } from '@/lib/auth/profile-sync';
import { canManageInvites, resolveStaffActor } from '@/lib/auth/staff-access-server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

/** One-time repair: create missing login profiles for approved members. */
export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const actor = await resolveStaffActor(request);
  if (!actor || !canManageInvites(actor)) {
    return NextResponse.json({ error: 'Staff access required' }, { status: 403 });
  }

  const result = await syncAllMemberProfiles(db);
  return NextResponse.json({
    ok: true,
    message: `Synced ${result.synced} member login profile(s).`,
    ...result,
  });
}
