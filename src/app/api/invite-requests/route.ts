import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { mapInviteRequest } from '@/lib/supabase/mappers';
import { normalizePhone } from '@/lib/auth/session';

export async function GET(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = db.from('invite_requests').select('*').order('requested_at', { ascending: false });
  if (status) {
    query = query.eq('status', status as 'pending' | 'approved' | 'declined');
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json((data ?? []).map(mapInviteRequest));
}

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const body = await request.json();
  const phone = normalizePhone(body.phone ?? '');

  if (!body.surname?.trim() || !body.fullName?.trim() || phone.length < 9 || !body.campus) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data: existing } = await db
    .from('invite_requests')
    .select('*')
    .eq('phone', phone)
    .eq('status', 'pending')
    .maybeSingle();

  if (existing) {
    return NextResponse.json(mapInviteRequest(existing));
  }

  const { data, error } = await db
    .from('invite_requests')
    .insert({
      surname: body.surname.trim(),
      full_name: body.fullName.trim(),
      phone,
      campus_id: body.campus,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapInviteRequest(data));
}
