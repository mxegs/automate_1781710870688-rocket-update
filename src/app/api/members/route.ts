import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const { data, error } = await db
    .from('members')
    .select('id, full_name, phone, campus_id, gender, status, member_since')
    .eq('status', 'active')
    .order('full_name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
