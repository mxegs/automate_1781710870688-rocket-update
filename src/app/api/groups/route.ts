import { NextResponse } from 'next/server';
import { churchIdFromUrl } from '@/lib/church/tenant';
import { notFoundResponse, requireSessionChurch } from '@/lib/auth/session-church';
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

export async function GET(request: Request) {
  const churchId = churchIdFromUrl(request.url);
  const denied = await requireSessionChurch(request, churchId);
  if (denied) return denied;

  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const actor = await resolveStaffActor(request);
  const email = readSessionEmailHeader(request);
  const { data: profile } = await db
    .from('profiles')
    .select('phone')
    .ilike('email', email)
    .eq('church_id', churchId)
    .maybeSingle();

  const visible = await visibleGroupIdsForSession(db, churchId!, actor, profile?.phone);
  if (visible !== 'all' && visible.length === 0) return NextResponse.json([]);

  let query = db.from('groups').select(GROUP_SELECT).eq('church_id', churchId).order('created_at', { ascending: false });
  if (visible !== 'all') query = query.in('id', visible);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const phone = profile?.phone ? normalizePhone(profile.phone) : '';
  const pastoral = Boolean(actor && canUsePastoralStaffTools(actor));
  const asLeader = actor?.dbRole === 'leader';
  return NextResponse.json(
    (data ?? []).map((row) => {
      const group = mapGroup(row);
      if (pastoral || asLeader) return group;
      return { ...group, memberPhones: group.memberPhones.filter((p) => normalizePhone(p) === phone) };
    }),
  );
}

export async function POST(request: Request) {
  const churchId = churchIdFromUrl(request.url);
  const denied = await requireSessionChurch(request, churchId);
  if (denied) return denied;

  const actor = await resolveStaffActor(request);
  if (!actor || !canUsePastoralStaffTools(actor)) return notFoundResponse();

  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const body = await request.json();
  if (!body.name?.trim() || !body.leaderPhone || !body.leaderName || !body.campus) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data: group, error } = await db
    .from('groups')
    .insert({
      name: body.name.trim(),
      church_id: churchId,
      category: body.category ?? 'community',
      campus_id: body.campus,
      description: body.description ?? null,
      leader_phone: normalizePhone(body.leaderPhone),
      leader_name: body.leaderName.trim(),
      enable_song_library: body.enableSongLibrary ?? false,
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const memberPhones: string[] = (body.memberPhones ?? []).map(normalizePhone);
  if (memberPhones.length > 0) {
    await db.from('group_members').insert(
      memberPhones.map((phone) => ({
        group_id: group.id,
        member_phone: phone,
        role: 'member' as const,
      })),
    );
  }

  const { data: full } = await db.from('groups').select(GROUP_SELECT).eq('id', group.id).single();
  return NextResponse.json(mapGroup(full!));
}
