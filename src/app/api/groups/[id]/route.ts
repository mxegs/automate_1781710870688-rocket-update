import { NextResponse } from 'next/server';
import { churchIdFromUrl } from '@/lib/church/tenant';
import { notFoundResponse, requireSessionChurch, requireSessionChurchId } from '@/lib/auth/session-church';
import {
  canUsePastoralStaffTools,
  readSessionEmailHeader,
  resolveStaffActor,
} from '@/lib/auth/staff-access-server';
import { visibleGroupIdsForSession } from '@/lib/groups/access-server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { mapGroup } from '@/lib/supabase/mappers';
import { normalizePhone } from '@/lib/auth/session';

const GROUP_SELECT = '*, group_members(member_phone)';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireSessionChurch(request, churchIdFromUrl(request.url));
  if (denied) return denied;

  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const { id } = await params;
  const churchId = churchIdFromUrl(request.url);
  const actor = await resolveStaffActor(request);
  const email = readSessionEmailHeader(request);
  const { data: profile } = await db
    .from('profiles')
    .select('phone')
    .ilike('email', email)
    .eq('church_id', churchId)
    .maybeSingle();
  const visible = await visibleGroupIdsForSession(db, churchId!, actor, profile?.phone);
  if (visible !== 'all' && !visible.includes(id)) return notFoundResponse();

  const { data, error } = await db
    .from('groups')
    .select(GROUP_SELECT)
    .eq('id', id)
    .eq('church_id', churchId)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const group = mapGroup(data);
  const pastoral = Boolean(actor && canUsePastoralStaffTools(actor));
  const asLeader = actor?.dbRole === 'leader';
  if (pastoral || asLeader) return NextResponse.json(group);
  const phone = profile?.phone ? normalizePhone(profile.phone) : '';
  return NextResponse.json({
    ...group,
    memberPhones: group.memberPhones.filter((p) => normalizePhone(p) === phone),
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await resolveStaffActor(request);
  if (!actor || !canUsePastoralStaffTools(actor)) return notFoundResponse();

  const churchId = await requireSessionChurchId(request);
  if (churchId instanceof NextResponse) return churchId;

  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const { id } = await params;
  const { data: group } = await db.from('groups').select('id, church_id').eq('id', id).maybeSingle();
  if (!group || group.church_id !== churchId) return notFoundResponse();

  const body = await request.json();

  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) patch.name = body.name;
  if (body.category !== undefined) patch.category = body.category;
  if (body.campus !== undefined) patch.campus_id = body.campus;
  if (body.description !== undefined) patch.description = body.description;
  if (body.leaderPhone !== undefined) patch.leader_phone = normalizePhone(body.leaderPhone);
  if (body.leaderName !== undefined) patch.leader_name = body.leaderName;
  if (body.enableSongLibrary !== undefined) patch.enable_song_library = body.enableSongLibrary;

  const { error } = await db.from('groups').update(patch).eq('id', id).eq('church_id', churchId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (body.leaderPhone) {
    const leaderPhone = normalizePhone(body.leaderPhone);
    await db
      .from('profiles')
      .update({ role: 'leader' })
      .eq('phone', leaderPhone)
      .eq('church_id', churchId)
      .neq('role', 'super_admin');
  }

  if (body.memberPhones) {
    await db.from('group_members').delete().eq('group_id', id);
    const phones = body.memberPhones.map(normalizePhone);
    if (phones.length > 0) {
      await db.from('group_members').insert(
        phones.map((phone: string) => ({ group_id: id, member_phone: phone, role: 'member' as const })),
      );
    }
  }

  const { data: full } = await db.from('groups').select(GROUP_SELECT).eq('id', id).single();
  return NextResponse.json(mapGroup(full!));
}
