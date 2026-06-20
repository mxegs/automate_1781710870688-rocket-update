import { NextResponse } from 'next/server';
import { getAppUrl } from '@/lib/app-url';
import type { CampusId } from '@/lib/church/constants';
import {
  canManageInvites,
  canManageCampus,
  resolveStaffActor,
} from '@/lib/auth/staff-access-server';
import { normalizeEmail } from '@/lib/auth/super-admin';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { generateToken, mapInvite } from '@/lib/supabase/mappers';
import { sendInviteEmail } from '@/lib/email/service';

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const actor = await resolveStaffActor(request);
  if (!actor || !canManageInvites(actor)) {
    return NextResponse.json({ error: 'Staff access required to send invites' }, { status: 403 });
  }

  const body = await request.json();
  const email = normalizeEmail(body.email ?? '');
  const campusId = (body.campusId as CampusId | undefined) ?? actor.campusId ?? 'midrand';

  if (!body.officialName?.trim() || !email.includes('@')) {
    return NextResponse.json({ error: 'Full name and email are required' }, { status: 400 });
  }

  if (!canManageCampus(actor, campusId)) {
    return NextResponse.json({ error: 'You can only send invites for your campus' }, { status: 403 });
  }

  const token = generateToken();
  const { data, error } = await db
    .from('invites')
    .insert({
      token,
      email,
      official_name: body.officialName.trim(),
      username: body.username?.trim() || null,
      campus_id: campusId,
      invite_request_id: body.inviteRequestId ?? null,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const inviteUrl = `${getAppUrl(request)}/invite/${token}`;
  const emailResult = await sendInviteEmail(email, body.officialName.trim(), inviteUrl);

  return NextResponse.json({
    ...mapInvite(data),
    inviteUrl,
    emailDelivery: {
      success: emailResult.success,
      demo: emailResult.demo ?? false,
      error: emailResult.error,
    },
  });
}
