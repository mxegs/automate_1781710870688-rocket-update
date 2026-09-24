import { NextResponse } from 'next/server';
import { getAppUrl } from '@/lib/app-url';
import { ensureProfileForEmail } from '@/lib/auth/profile-sync';
import { normalizeEmail } from '@/lib/auth/super-admin';
import { normalizePhone } from '@/lib/auth/session';
import { sendMembershipApprovedEmail } from '@/lib/email/service';
import { churchDisplayName } from '@/lib/church/name-server';
import { sendSms } from '@/lib/sms/service';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const { id } = await params;
  const body = await request.json();
  const status = body.status as 'approved' | 'rejected';

  if (status !== 'approved' && status !== 'rejected') {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const { data: app, error: fetchError } = await db
    .from('membership_applications')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

  // Reject: update status only
  if (status === 'rejected') {
    const { data, error } = await db
      .from('membership_applications')
      .update({
        status: 'rejected',
        review_notes: body.reviewNotes ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // Approve: create member + login profile FIRST, then mark approved, then notify
  const personal = (app.application_data as { personal?: Record<string, string> })?.personal ?? {};
  const covenant = (app.application_data as { covenant?: { dateSigned?: string } })?.covenant;
  const appRow = app as { password_hash?: string | null };
  const memberPhone = normalizePhone(app.phone ?? '');
  const memberEmail = personal.email ? normalizeEmail(personal.email) : '';

  if (!memberPhone) {
    return NextResponse.json(
      { error: 'Cannot approve: application has no valid phone number for the member record.' },
      { status: 400 },
    );
  }

  const { error: memberError } = await db.from('members').insert({
    application_id: id,
    campus_id: app.campus_id,
    surname: personal.surname ?? '',
    full_name: personal.fullName ?? '',
    username: personal.username ?? null,
    phone: memberPhone,
    email: memberEmail.includes('@') ? memberEmail : null,
    gender: (personal.gender as 'Male' | 'Female') ?? null,
    date_of_birth: personal.dateOfBirth || null,
    age: typeof personal.age === 'number' ? personal.age : null,
    marital_status: personal.maritalStatus ?? null,
    covenant_signed_at: covenant?.dateSigned ?? new Date().toISOString(),
    status: 'active',
  });

  if (memberError) {
    // Unique conflict: member may already exist from a partial prior attempt
    const isDuplicate =
      memberError.code === '23505' ||
      /duplicate|unique/i.test(memberError.message);

    if (!isDuplicate) {
      return NextResponse.json(
        { error: `Could not create member record: ${memberError.message}` },
        { status: 500 },
      );
    }
  }

  if (memberEmail.includes('@')) {
    const profile = await ensureProfileForEmail(db, memberEmail);
    if (!profile?.email) {
      return NextResponse.json(
        {
          error:
            'Member row was created but login profile failed. Fix the profile for this email, then try approve again if still pending.',
        },
        { status: 500 },
      );
    }
  } else {
    const { error: profileError } = await db.from('profiles').upsert(
      {
        phone: memberPhone,
        role: 'member',
        campus_id: app.campus_id,
        official_name: personal.fullName ?? null,
        username: personal.username ?? null,
        display_name: personal.username ?? personal.fullName ?? null,
        gender: (personal.gender as 'Male' | 'Female') ?? null,
        date_of_birth: personal.dateOfBirth || null,
        email: null,
        password_hash: appRow.password_hash ?? null,
      },
      { onConflict: 'phone' },
    );

    if (profileError) {
      return NextResponse.json(
        { error: `Could not create login profile: ${profileError.message}` },
        { status: 500 },
      );
    }
  }

  const { data, error } = await db
    .from('membership_applications')
    .update({
      status: 'approved',
      review_notes: body.reviewNotes ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json(
      {
        error: `Member was created but application status update failed: ${error.message}`,
      },
      { status: 500 },
    );
  }

  const firstName = personal.fullName?.trim().split(/\s+/)[0] || 'Friend';
  const loginUrl = `${getAppUrl(request)}/login`;

  const churchName = await churchDisplayName((app as { church_id?: string | null }).church_id);
  if (memberEmail.includes('@')) {
    await sendMembershipApprovedEmail(memberEmail, firstName, loginUrl, (app as { church_id?: string | null }).church_id ?? null);
  }

  if (app.phone) {
    await sendSms(
      app.phone,
      `Hi ${firstName}, your ${churchName} membership is approved! Sign in at ${loginUrl} with your email and password.`,
    );
  }

  return NextResponse.json(data);
}
