import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { generateToken, mapInvite } from '@/lib/supabase/mappers';
import { normalizePhone } from '@/lib/auth/session';

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const body = await request.json();
  const phone = normalizePhone(body.phone ?? '');

  if (!body.officialName?.trim() || phone.length < 9) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const token = generateToken();
  const { data, error } = await db
    .from('invites')
    .insert({
      token,
      phone,
      official_name: body.officialName.trim(),
      username: body.username?.trim() || null,
      campus_id: body.campusId ?? null,
      invite_request_id: body.inviteRequestId ?? null,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapInvite(data));
}
