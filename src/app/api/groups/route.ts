import { NextResponse } from 'next/server';
import { churchIdFromUrl } from '@/lib/church/tenant';
import { requireSessionChurch } from '@/lib/auth/session-church';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { mapGroup } from '@/lib/supabase/mappers';
import { normalizePhone } from '@/lib/auth/session';

const GROUP_SELECT = '*, group_members(member_phone)';

export async function GET(request: Request) {
  const denied = await requireSessionChurch(request, churchIdFromUrl(request.url));
  if (denied) return denied;

  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const { data, error } = await db
    .from('groups')
    .select(GROUP_SELECT)
    .eq('church_id', churchIdFromUrl(request.url))
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json((data ?? []).map(mapGroup));
}

export async function POST(request: Request) {
  const churchId = churchIdFromUrl(request.url);
  const denied = await requireSessionChurch(request, churchId);
  if (denied) return denied;

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
