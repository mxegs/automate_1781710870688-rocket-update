import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { getAppUrl } from '@/lib/app-url';
import { churchIdFromUrl } from '@/lib/church/tenant';
import { churchIdForSessionEmail, notFoundResponse, requireSessionChurch } from '@/lib/auth/session-church';
import { readSessionEmailHeader } from '@/lib/auth/staff-access-server';
import { normalizeEmail } from '@/lib/auth/super-admin';
import { sendEmailChangeConfirmEmail } from '@/lib/email/service';
import {
  digits,
  isValidEmail,
  loadOwnProfilePayload,
  MARITAL_STATUSES,
  showMarriageDate,
} from '@/lib/members/own-profile';
import type { MembershipApplication } from '@/lib/membership/types';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

async function sessionMemberContext(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return { error: NextResponse.json({ error: 'Backend not configured' }, { status: 503 }) };

  const email = readSessionEmailHeader(request);
  if (!email.includes('@')) return { error: notFoundResponse() };

  const requested = churchIdFromUrl(request.url);
  if (requested) {
    const denied = await requireSessionChurch(request, requested);
    if (denied) return { error: denied };
  }

  const churchId = requested ?? (await churchIdForSessionEmail(request));
  if (!churchId) return { error: notFoundResponse() };

  const { data: profiles, error: profileError } = await db
    .from('profiles')
    .select('id, email, phone, photo_url, church_id, campus_id, official_name, display_name, role')
    .ilike('email', email)
    .eq('church_id', churchId)
    .limit(2);

  if (profileError) return { error: NextResponse.json({ error: profileError.message }, { status: 500 }) };
  if (!profiles?.length || profiles.length > 1) return { error: notFoundResponse() };

  const profile = profiles[0] as Record<string, unknown>;

  const { data: member, error: memberError } = await db
    .from('members')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('church_id', churchId)
    .maybeSingle();

  if (memberError) return { error: NextResponse.json({ error: memberError.message }, { status: 500 }) };
  if (!member) return { error: notFoundResponse() };

  return { db, email, churchId, profile, member: member as Record<string, unknown> };
}

export async function GET(request: Request) {
  const ctx = await sessionMemberContext(request);
  if ('error' in ctx && ctx.error) return ctx.error;
  const { db, email, churchId, profile, member } = ctx as Exclude<Awaited<ReturnType<typeof sessionMemberContext>>, { error: NextResponse }>;
  const payload = await loadOwnProfilePayload(db, { email, churchId, profile, member });
  return NextResponse.json(payload);
}

export async function PATCH(request: Request) {
  const ctx = await sessionMemberContext(request);
  if ('error' in ctx && ctx.error) return ctx.error;
  const { db, email, churchId, profile, member } = ctx as Exclude<Awaited<ReturnType<typeof sessionMemberContext>>, { error: NextResponse }>;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const memberId = String(member.id);
  const profileId = String(profile.id);
  const patch: Record<string, unknown> = {};
  let pendingEmail: string | null = null;
  let confirmUrl: string | undefined;

  if (typeof body.phone === 'string') {
    const phoneDigits = digits(body.phone);
    if (phoneDigits.length < 9) {
      return NextResponse.json({ error: 'Phone must have at least 9 digits' }, { status: 400 });
    }
    patch.phone = body.phone.trim();
  }

  if (typeof body.maritalStatus === 'string') {
    if (!MARITAL_STATUSES.includes(body.maritalStatus as (typeof MARITAL_STATUSES)[number])) {
      return NextResponse.json({ error: 'Invalid marital status' }, { status: 400 });
    }
    patch.marital_status = body.maritalStatus;
  }

  const nextMarital = String(patch.marital_status ?? member.marital_status ?? '');
  if ('marriageDate' in body) {
    const raw = typeof body.marriageDate === 'string' ? body.marriageDate.trim() : '';
    if (raw && !/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return NextResponse.json({ error: 'Invalid marriage date' }, { status: 400 });
    }
    patch.marriage_date = showMarriageDate(nextMarital) && raw ? raw : null;
  } else if (typeof patch.marital_status === 'string' && !showMarriageDate(nextMarital)) {
    patch.marriage_date = null;
  }

  const resend = body.resendPendingEmail === true;
  if (typeof body.email === 'string' || resend) {
    const nextEmail = normalizeEmail(resend ? String(member.pending_email ?? '') : String(body.email ?? ''));
    if (!isValidEmail(nextEmail)) {
      return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
    }
    const current = normalizeEmail(String(member.email ?? profile.email ?? email));
    if (nextEmail !== current) {
      const token = randomBytes(24).toString('hex');
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      patch.pending_email = nextEmail;
      patch.pending_email_token = token;
      patch.pending_email_expires_at = expires;
      pendingEmail = nextEmail;
      confirmUrl = `${getAppUrl(request)}/member/profile/confirm-email?token=${encodeURIComponent(token)}`;
      await sendEmailChangeConfirmEmail(nextEmail, confirmUrl, churchId);
    }
  }

  if (Object.keys(patch).length) {
    const { error: updateError } = await db
      .from('members')
      .update(patch)
      .eq('id', memberId)
      .eq('church_id', churchId)
      .eq('profile_id', profileId);
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (typeof patch.phone === 'string') {
    await db.from('profiles').update({ phone: patch.phone }).eq('id', profileId).eq('church_id', churchId);
  }

  const applicationId = typeof member.application_id === 'string' ? member.application_id : '';
  if (applicationId) {
    const { data: app } = await db
      .from('membership_applications')
      .select('application_data')
      .eq('id', applicationId)
      .eq('church_id', churchId)
      .maybeSingle();
    const data = (app?.application_data ?? null) as MembershipApplication | null;
    if (data?.personal) {
      if (typeof body.address === 'string') data.personal.permanentAddress = body.address.trim();
      if (typeof body.occupation === 'string') {
        const occ = body.occupation.trim();
        data.personal.occupation = occ ? [occ] : [];
        data.personal.occupationOther = '';
      }
      if (typeof body.phone === 'string') data.personal.cellNo = body.phone.trim();
      if (typeof body.maritalStatus === 'string') {
        data.personal.maritalStatus = body.maritalStatus as MembershipApplication['personal']['maritalStatus'];
      }
      if ('marriageDate' in body || typeof patch.marriage_date !== 'undefined') {
        data.personal.marriageDate = typeof patch.marriage_date === 'string' ? patch.marriage_date : '';
      }
      if (!data.emergencyContact) {
        data.emergencyContact = { name: '', relationship: '', phoneNumber: '' };
      }
      if (typeof body.emergencyContactName === 'string') data.emergencyContact.name = body.emergencyContactName.trim();
      if (typeof body.emergencyContactRelationship === 'string') {
        data.emergencyContact.relationship = body.emergencyContactRelationship.trim();
      }
      if (typeof body.emergencyContactPhone === 'string') {
        data.emergencyContact.phoneNumber = body.emergencyContactPhone.trim();
      }
      await db
        .from('membership_applications')
        .update({ application_data: data })
        .eq('id', applicationId)
        .eq('church_id', churchId);
    }
  }

  const { data: refreshed } = await db
    .from('members')
    .select('*')
    .eq('id', memberId)
    .eq('church_id', churchId)
    .maybeSingle();

  const payload = await loadOwnProfilePayload(db, {
    email,
    churchId,
    profile,
    member: (refreshed ?? member) as Record<string, unknown>,
  });

  return NextResponse.json({
    ...payload,
    pendingEmail: pendingEmail ?? payload.pendingEmail,
    confirmUrl,
  });
}
