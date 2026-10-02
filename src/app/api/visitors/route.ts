import { NextResponse } from 'next/server';
import { churchIdFromUrl } from '@/lib/church/tenant';
import { notFoundResponse, requireSessionChurch } from '@/lib/auth/session-church';
import { canUsePastoralStaffTools, resolveStaffActor } from '@/lib/auth/staff-access-server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const actor = await resolveStaffActor(request);
  if (!actor || !canUsePastoralStaffTools(actor)) return notFoundResponse();

  const churchId = churchIdFromUrl(request.url);
  const denied = await requireSessionChurch(request, churchId);
  if (denied) return denied;

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const sinceDays = Number(new URL(request.url).searchParams.get('sinceDays') ?? '');
  let query = db
    .from('visitors')
    .select('id, name, email, phone, campus_id, source, created_at')
    .eq('church_id', churchId)
    .order('created_at', { ascending: false });

  if (Number.isInteger(sinceDays) && sinceDays > 0) {
    query = query.gte('created_at', new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString());
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
