import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { normalizePhone } from '@/lib/auth/session';

export async function GET(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const phone = normalizePhone(new URL(request.url).searchParams.get('phone') ?? '');
  const email = new URL(request.url).searchParams.get('email')?.trim().toLowerCase() ?? '';
  if (phone.length < 9 && !email) {
    return NextResponse.json({ error: 'Phone or email is required' }, { status: 400 });
  }

  let profileQuery = db.from('profiles').select('id').limit(5);
  if (phone.length >= 9) {
    const suffix = phone.slice(-9);
    profileQuery = profileQuery.or(`phone.eq.${phone},phone.like.%${suffix}`);
  }
  const { data: profiles, error: profileError } = await profileQuery;
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

  const profile = profiles?.[0];
  if (!profile) return NextResponse.json({ profileId: null, memberId: null });

  const { data: member, error: memberError } = await db
    .from('members')
    .select('id')
    .eq('profile_id', profile.id)
    .maybeSingle();

  if (memberError) return NextResponse.json({ error: memberError.message }, { status: 500 });

  return NextResponse.json({ profileId: profile.id, memberId: member?.id ?? null });
}
