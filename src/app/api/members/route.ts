import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status');

  let query = db
    .from('members')
    .select('id, full_name, surname, phone, email, campus_id, gender, age, status, member_since, application_id')
    .order('full_name');

  if (statusFilter === 'active') {
    query = query.eq('status', 'active');
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
