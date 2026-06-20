import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

/** Minimal info for post-signup password setup (submitted applications only). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const { id } = await params;

  const { data, error } = await db
    .from('membership_applications')
    .select('id, status, application_data')
    .eq('id', id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.status !== 'submitted') {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  const personal = (data.application_data as { personal?: { email?: string } })?.personal;
  const email = personal?.email?.trim().toLowerCase() ?? '';

  if (!email.includes('@')) {
    return NextResponse.json({ error: 'No email on application' }, { status: 400 });
  }

  return NextResponse.json({ id: data.id, email });
}
