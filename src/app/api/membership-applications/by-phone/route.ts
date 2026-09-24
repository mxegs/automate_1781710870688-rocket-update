import { NextResponse } from 'next/server';
import { churchIdFromUrl } from '@/lib/church/tenant';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { normalizePhone } from '@/lib/auth/session';

export async function GET(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const phone = normalizePhone(new URL(request.url).searchParams.get('phone') ?? '');
  if (phone.length < 9) return NextResponse.json({ error: 'Phone is required' }, { status: 400 });

  const suffix = phone.slice(-9);
  const { data, error } = await db
    .from('membership_applications')
    .select('application_data, phone, status')
    .eq('church_id', churchIdFromUrl(request.url))
    .in('status', ['submitted', 'approved'])
    .or(`phone.eq.${phone},phone.like.%${suffix}`)
    .order('submitted_at', { ascending: false })
    .limit(1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data?.[0]?.application_data ?? null);
}
