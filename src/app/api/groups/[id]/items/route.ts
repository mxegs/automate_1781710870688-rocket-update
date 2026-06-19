import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { mapBroadcast, mapSong } from '@/lib/supabase/mappers';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const { id: groupId } = await params;
  const { searchParams } = new URL(_request.url);
  const type = searchParams.get('type') ?? 'broadcasts';

  if (type === 'songs') {
    const { data, error } = await db
      .from('group_songs')
      .select('*')
      .eq('group_id', groupId)
      .order('title');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json((data ?? []).map(mapSong));
  }

  const { data, error } = await db
    .from('group_broadcasts')
    .select('*')
    .eq('group_id', groupId)
    .order('scheduled_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(mapBroadcast));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const { id: groupId } = await params;
  const body = await request.json();

  if (body.type === 'song') {
    const { data, error } = await db
      .from('group_songs')
      .insert({
        group_id: groupId,
        title: body.title,
        musical_key: body.key,
        verse1: body.verse1 ?? '',
        verse2: body.verse2 ?? '',
        chorus: body.chorus ?? '',
        bridge: body.bridge ?? null,
        notes: body.notes ?? null,
        sent_at: body.sentAt ?? null,
      })
      .select('*')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(mapSong(data));
  }

  const { data, error } = await db
    .from('group_broadcasts')
    .insert({
      group_id: groupId,
      message: body.message,
      scheduled_at: body.scheduledAt,
      status: body.status ?? 'scheduled',
      created_by_phone: body.createdByPhone ?? null,
    })
    .select('*')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapBroadcast(data));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const body = await request.json();
  if (body.songId && body.sentAt) {
    const { data, error } = await db
      .from('group_songs')
      .update({ sent_at: body.sentAt })
      .eq('id', body.songId)
      .select('*')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(mapSong(data));
  }

  return NextResponse.json({ error: 'Invalid patch' }, { status: 400 });
}
