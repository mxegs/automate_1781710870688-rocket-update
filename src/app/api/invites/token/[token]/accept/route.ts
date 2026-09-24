import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const { token } = await params;
  const { data: invite, error } = await db
    .from('invites')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 });

  const churchId = (invite as { church_id?: string | null }).church_id;
  if (!churchId) {
    return NextResponse.json({ error: 'This invite is not linked to a church' }, { status: 400 });
  }

  const email = String((invite as { email?: string | null }).email ?? '').trim().toLowerCase();
  const phone = String(invite.phone ?? '').trim() || `invite${token.slice(0, 8)}`;
  const officialName = invite.official_name as string;

  const { data: existing } = email
    ? await db.from('profiles').select('id').ilike('email', email).maybeSingle()
    : { data: null };

  if (existing?.id) {
    const { error: updateError } = await db
      .from('profiles')
      .update({ church_id: churchId })
      .eq('id', existing.id);
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
  } else {
    const { error: insertError } = await db.from('profiles').insert({
      id: crypto.randomUUID(),
      phone,
      email: email || null,
      role: 'member',
      church_id: churchId,
      campus_id: invite.campus_id,
      official_name: officialName,
      display_name: officialName,
    });
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const { data: church } = await db
    .from('churches')
    .select('slug, name')
    .eq('id', churchId)
    .maybeSingle();

  return NextResponse.json({
    churchId,
    churchSlug: church?.slug ?? null,
    churchName: church?.name ?? null,
  });
}
