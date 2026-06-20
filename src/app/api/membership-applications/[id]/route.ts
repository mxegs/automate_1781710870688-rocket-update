import { NextResponse } from 'next/server';
import { getAppUrl } from '@/lib/app-url';
import { sendMembershipApprovedEmail } from '@/lib/email/service';
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

  const { data: app, error: fetchError } = await db
    .from('membership_applications')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });

  const { data, error } = await db
    .from('membership_applications')
    .update({
      status,
      review_notes: body.reviewNotes ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (status === 'approved' && app) {
    const personal = (app.application_data as { personal?: Record<string, string> })?.personal ?? {};
    const covenant = (app.application_data as { covenant?: { dateSigned?: string } })?.covenant;
    const appRow = app as { password_hash?: string | null };

    await db.from('members').insert({
      application_id: id,
      campus_id: app.campus_id,
      surname: personal.surname ?? '',
      full_name: personal.fullName ?? '',
      username: personal.username ?? null,
      phone: app.phone,
      email: personal.email ?? null,
      gender: (personal.gender as 'Male' | 'Female') ?? null,
      date_of_birth: personal.dateOfBirth || null,
      age: typeof personal.age === 'number' ? personal.age : null,
      marital_status: personal.maritalStatus ?? null,
      covenant_signed_at: covenant?.dateSigned ?? new Date().toISOString(),
      status: 'active',
    });

    await db.from('profiles').upsert(
      {
        phone: app.phone,
        role: 'member',
        campus_id: app.campus_id,
        official_name: personal.fullName ?? null,
        username: personal.username ?? null,
        display_name: personal.username ?? personal.fullName ?? null,
        gender: (personal.gender as 'Male' | 'Female') ?? null,
        date_of_birth: personal.dateOfBirth || null,
        email: personal.email ?? null,
        password_hash: appRow.password_hash ?? null,
      },
      { onConflict: 'phone' },
    );

    const firstName = personal.fullName?.trim().split(/\s+/)[0] || 'Friend';
    const memberEmail = personal.email?.trim().toLowerCase();
    const loginUrl = `${getAppUrl(request)}/login`;

    if (memberEmail?.includes('@')) {
      await sendMembershipApprovedEmail(memberEmail, firstName, loginUrl);
    }

    if (app.phone) {
      await sendSms(
        app.phone,
        `Hi ${firstName}, your CKC membership is approved! Sign in at ${loginUrl} with your email and password.`,
      );
    }
  }

  return NextResponse.json(data);
}
