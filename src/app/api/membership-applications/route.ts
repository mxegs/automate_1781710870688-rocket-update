import { NextResponse } from 'next/server';
import { assignDependantSerials } from '@/lib/membership/family';
import { getAppUrl } from '@/lib/app-url';
import { sendApplicationReceivedEmail } from '@/lib/email/service';
import { sendSms } from '@/lib/sms/service';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { normalizePhone } from '@/lib/auth/session';

function mapApplication(row: {
  id: string;
  phone: string;
  campus_id: string;
  status: string;
  application_data: Record<string, unknown>;
  submitted_at: string | null;
  created_at: string;
}) {
  return {
    id: row.id,
    phone: row.phone,
    campus: row.campus_id,
    status: row.status,
    applicationData: row.application_data,
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
  };
}

export async function GET(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') ?? 'submitted';

  const { data, error } = await db
    .from('membership_applications')
    .select('*')
    .eq('status', status as 'draft' | 'submitted' | 'approved' | 'rejected')
    .order('submitted_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(mapApplication));
}

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const body = await request.json();
  const phone = normalizePhone(body.phone ?? '');
  let applicationData = (body.applicationData ?? body) as import('@/lib/membership/types').MembershipApplication;

  if (phone.length < 9 || !body.campusId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  applicationData = await assignDependantSerials(applicationData);
  if (!applicationData.guardian.familyGroupId) {
    applicationData = {
      ...applicationData,
      guardian: {
        ...applicationData.guardian,
        familyGroupId: applicationData.personal.identityNumber,
      },
    };
  }

  const { data, error } = await db
    .from('membership_applications')
    .insert({
      phone,
      campus_id: body.campusId,
      invite_id: body.inviteId ?? null,
      status: 'submitted',
      application_data: applicationData,
      submitted_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (body.inviteToken) {
    await db
      .from('invites')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('token', body.inviteToken);
  }

  const personal = (applicationData as { personal?: { fullName?: string; email?: string } })?.personal;
  const firstName = personal?.fullName?.trim().split(/\s+/)[0] || 'Friend';
  const memberEmail = personal?.email?.trim().toLowerCase();

  if (memberEmail?.includes('@')) {
    await sendApplicationReceivedEmail(memberEmail, firstName);
  }

  if (phone.length >= 9) {
    await sendSms(
      phone,
      `Hi ${firstName}, CKC received your membership application. We will email and SMS you when it is approved.`,
    );
  }

  return NextResponse.json(mapApplication(data));
}
