import { NextResponse } from 'next/server';
import { churchIdFromUrl } from '@/lib/church/tenant';
import { churchIdForSessionEmail, requireSessionChurch } from '@/lib/auth/session-church';
import { assignDependantSerials } from '@/lib/membership/family';
import { sendApplicationReceivedEmail } from '@/lib/email/service';
import { churchDisplayName } from '@/lib/church/name-server';
import { sendSms } from '@/lib/sms/service';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { normalizePhone } from '@/lib/auth/session';
import type { SupabaseClient } from '@supabase/supabase-js';

function notFound() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

async function churchIdFromInviteToken(
  db: SupabaseClient,
  token: unknown,
): Promise<string | null> {
  if (typeof token !== 'string' || !token.trim()) return null;
  const { data } = await db
    .from('invites')
    .select('church_id')
    .eq('token', token.trim())
    .maybeSingle();
  return (data as { church_id?: string | null } | null)?.church_id?.trim() || null;
}

async function churchIdFromSlugQuery(db: SupabaseClient, url: string): Promise<string | null> {
  const slug = new URL(url).searchParams.get('churchSlug')?.trim().toLowerCase();
  if (!slug) return null;
  const { data } = await db.from('churches').select('id').eq('slug', slug).maybeSingle();
  return (data as { id?: string | null } | null)?.id?.trim() || null;
}

async function resolveApplicationChurchId(
  request: Request,
  db: SupabaseClient,
  body: Record<string, unknown>,
): Promise<string | NextResponse> {
  const sessionChurchId = await churchIdForSessionEmail(request);
  const bodyChurchId = typeof body.churchId === 'string' ? body.churchId.trim() : '';
  const urlChurchId = churchIdFromUrl(request.url);

  if (sessionChurchId) {
    if (bodyChurchId && bodyChurchId !== sessionChurchId) return notFound();
    if (urlChurchId && urlChurchId !== sessionChurchId) return notFound();
    return sessionChurchId;
  }

  const inviteChurchId = await churchIdFromInviteToken(db, body.inviteToken);
  const slugChurchId = await churchIdFromSlugQuery(db, request.url);
  if (inviteChurchId && slugChurchId && inviteChurchId !== slugChurchId) return notFound();
  const churchId = inviteChurchId || slugChurchId;
  if (!churchId) return notFound();
  if (bodyChurchId && bodyChurchId !== churchId) return notFound();
  if (urlChurchId && urlChurchId !== churchId) return notFound();
  return churchId;
}

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
  const denied = await requireSessionChurch(request, churchIdFromUrl(request.url));
  if (denied) return denied;

  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') ?? 'submitted';

  const { data, error } = await db
    .from('membership_applications')
    .select('*')
    .eq('church_id', churchIdFromUrl(request.url))
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

  const churchResolved = await resolveApplicationChurchId(request, db, body as Record<string, unknown>);
  if (churchResolved instanceof NextResponse) return churchResolved;
  const churchId = churchResolved;

  const { data, error } = await db
    .from('membership_applications')
    .insert({
      phone,
      campus_id: body.campusId,
      invite_id: body.inviteId ?? null,
      church_id: churchId,
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
    await sendApplicationReceivedEmail(memberEmail, firstName, churchId);
  }

  if (phone.length >= 9) {
    const churchName = await churchDisplayName(churchId);
    await sendSms(
      phone,
      `Hi ${firstName}, ${churchName} received your membership application. We will email and SMS you when it is approved.`,
    );
  }

  return NextResponse.json(mapApplication(data));
}
