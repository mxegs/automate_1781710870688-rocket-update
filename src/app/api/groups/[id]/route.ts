import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { mapGroup } from '@/lib/supabase/mappers';
import { normalizePhone } from '@/lib/auth/session';

const GROUP_SELECT = '*, group_members(member_phone)';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const { id } = await params;
  const { data, error } = await db.from('groups').select(GROUP_SELECT).eq('id', id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(mapGroup(data));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const { id } = await params;
  const body = await request.json();

  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) patch.name = body.name;
  if (body.category !== undefined) patch.category = body.category;
  if (body.campus !== undefined) patch.campus_id = body.campus;
  if (body.description !== undefined) patch.description = body.description;
  if (body.leaderPhone !== undefined) patch.leader_phone = normalizePhone(body.leaderPhone);
  if (body.leaderName !== undefined) patch.leader_name = body.leaderName;
  if (body.enableSongLibrary !== undefined) patch.enable_song_library = body.enableSongLibrary;

  const { error } = await db.from('groups').update(patch).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

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
