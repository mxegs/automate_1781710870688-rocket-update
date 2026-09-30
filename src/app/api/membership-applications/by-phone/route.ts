import { NextResponse } from 'next/server';
import { churchIdFromUrl } from '@/lib/church/tenant';
import { notFoundResponse, requireSessionChurch } from '@/lib/auth/session-church';
import {
  canUsePastoralStaffTools,
  readSessionEmailHeader,
  resolveStaffActor,
} from '@/lib/auth/staff-access-server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { normalizePhone } from '@/lib/auth/session';

function samePhone(a: string, b: string): boolean {
  const left = normalizePhone(a);
  const right = normalizePhone(b);
  if (!left || !right) return false;
  if (left === right) return true;
  return left.slice(-9) === right.slice(-9);
}

export async function GET(request: Request) {
  const churchId = churchIdFromUrl(request.url);
  const denied = await requireSessionChurch(request, churchId);
  if (denied) return denied;

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const phone = normalizePhone(new URL(request.url).searchParams.get('phone') ?? '');
  if (phone.length < 9) return NextResponse.json({ error: 'Phone is required' }, { status: 400 });

  const actor = await resolveStaffActor(request);
  if (!actor || !canUsePastoralStaffTools(actor)) {
    const email = readSessionEmailHeader(request);
    const { data: profile } = await db
      .from('profiles')
      .select('phone')
      .ilike('email', email)
      .eq('church_id', churchId)
      .maybeSingle();
    if (!profile?.phone || !samePhone(profile.phone, phone)) return notFoundResponse();
  }

  const suffix = phone.slice(-9);
  const { data, error } = await db
    .from('membership_applications')
    .select('application_data, phone, status')
    .eq('church_id', churchId)
    .in('status', ['submitted', 'approved'])
    .or(`phone.eq.${phone},phone.like.%${suffix}`)
    .order('submitted_at', { ascending: false })
    .limit(1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data?.[0]?.application_data ?? null);
}
