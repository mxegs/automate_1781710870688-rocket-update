import { NextResponse } from 'next/server';
import { migrateApplication } from '@/lib/membership/migrate';
import type { MembershipApplication } from '@/lib/membership/types';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const token = new URL(request.url).searchParams.get('token')?.trim() ?? '';
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  const { data: rows, error } = await db
    .from('members')
    .select('id, church_id, profile_id, pending_email, pending_email_token, pending_email_expires_at, application_id')
    .eq('pending_email_token', token)
    .limit(2);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!rows?.length || rows.length > 1) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }

  const row = rows[0] as {
    id: string;
    church_id: string;
    profile_id: string | null;
    pending_email: string | null;
    pending_email_expires_at: string | null;
    application_id: string | null;
  };

  const expires = row.pending_email_expires_at ? new Date(row.pending_email_expires_at).getTime() : 0;
  if (!row.pending_email || !expires || expires < Date.now()) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }

  const email = row.pending_email.trim().toLowerCase();

  const { error: memberError } = await db
    .from('members')
    .update({
      email,
      pending_email: null,
      pending_email_token: null,
      pending_email_expires_at: null,
    })
    .eq('id', row.id)
    .eq('church_id', row.church_id);

  if (memberError) return NextResponse.json({ error: memberError.message }, { status: 500 });

  if (row.profile_id) {
    await db.from('profiles').update({ email }).eq('id', row.profile_id).eq('church_id', row.church_id);
  }

  if (row.application_id) {
    const { data: app } = await db
      .from('membership_applications')
      .select('application_data')
      .eq('id', row.application_id)
      .eq('church_id', row.church_id)
      .maybeSingle();
    if (app?.application_data) {
      const data = migrateApplication(app.application_data as MembershipApplication);
      data.personal.email = email;
      await db
        .from('membership_applications')
        .update({ application_data: data })
        .eq('id', row.application_id)
        .eq('church_id', row.church_id);
    }
  }

  const accept = request.headers.get('accept') ?? '';
  const wantsJson = accept.includes('application/json') || request.headers.get('x-session-email');
  if (wantsJson) {
    return NextResponse.json({ ok: true, email });
  }

  const dest = new URL('/member/profile?emailConfirmed=1', request.url);
  return NextResponse.redirect(dest);
}
