import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { MembershipApplication } from '@/lib/membership/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const { id } = await params;

  const { data: member, error } = await db
    .from('members')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

  let applicationData: MembershipApplication | null = null;
  let submittedAt: string | null = null;

  if (member.application_id) {
    const { data: app } = await db
      .from('membership_applications')
      .select('application_data, submitted_at')
      .eq('id', member.application_id)
      .maybeSingle();

    if (app?.application_data) {
      applicationData = app.application_data as MembershipApplication;
      submittedAt = app.submitted_at;
    }
  }

  return NextResponse.json({
    id: member.id,
    fullName: member.full_name,
    surname: member.surname,
    phone: member.phone,
    email: member.email,
    campusId: member.campus_id,
    gender: member.gender,
    age: member.age,
    status: member.status,
    memberSince: member.member_since,
    applicationId: member.application_id,
    applicationData,
    submittedAt,
  });
}

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
  const action = body.action as 'suspend' | 'reactivate' | 'terminate';

  const { data: member, error: fetchError } = await db
    .from('members')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

  if (action === 'suspend') {
    const { error } = await db.from('members').update({ status: 'suspended' }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, status: 'suspended' });
  }

  if (action === 'reactivate') {
    const { error } = await db.from('members').update({ status: 'active' }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, status: 'active' });
  }

  if (action === 'terminate') {
    await db.from('group_members').delete().eq('member_phone', member.phone);
    await db.from('members').delete().eq('id', id);

    const { data: profile } = await db
      .from('profiles')
      .select('id, role')
      .eq('phone', member.phone)
      .maybeSingle();

    if (profile?.role === 'member') {
      await db.from('profiles').delete().eq('id', profile.id);
    }

    return NextResponse.json({ ok: true, terminated: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
