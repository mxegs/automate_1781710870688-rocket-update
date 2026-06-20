import { NextResponse } from 'next/server';
import { getAppUrl } from '@/lib/app-url';
import { getCampusLabel } from '@/lib/church/constants';
import type { CampusId } from '@/lib/church/constants';
import {
  canManageInvites,
  canManageCampus,
  actorCampusScope,
  resolveStaffActor,
} from '@/lib/auth/staff-access-server';
import { isInternalPlaceholderPhone, normalizeEmail } from '@/lib/auth/super-admin';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { mapInviteRequest } from '@/lib/supabase/mappers';
import { buildInviteRequestNotifyMessage, sendBulkSms } from '@/lib/sms/service';

async function notifyCampusAdmins(
  campusId: CampusId,
  fullName: string,
  email: string,
  request: Request,
): Promise<void> {
  const db = getSupabaseAdmin();
  if (!db) return;

  const { data: staff } = await db
    .from('profiles')
    .select('phone, email, role, campus_id')
    .in('role', ['super_admin', 'admin', 'pastor']);

  const phones = (staff ?? [])
    .filter((row) => row.role !== 'super_admin' && row.campus_id === campusId)
    .map((row) => row.phone)
    .filter((phone): phone is string => Boolean(phone) && !isInternalPlaceholderPhone(phone));

  if (phones.length === 0) return;

  const membersUrl = `${getAppUrl(request)}/members`;
  const message = buildInviteRequestNotifyMessage(
    fullName,
    email,
    getCampusLabel(campusId),
    membersUrl,
  );

  await sendBulkSms(phones, message);
}

export async function GET(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = db.from('invite_requests').select('*').order('requested_at', { ascending: false });
  if (status) {
    query = query.eq('status', status as 'pending' | 'approved' | 'declined');
  }

  const actor = await resolveStaffActor(request);
  const campusScope = actor ? actorCampusScope(actor) : null;
  if (campusScope) {
    query = query.eq('campus_id', campusScope);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json((data ?? []).map(mapInviteRequest));
}

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const body = await request.json();
  const email = normalizeEmail(body.email ?? '');

  if (!body.surname?.trim() || !body.fullName?.trim() || !email.includes('@') || !body.campus) {
    return NextResponse.json({ error: 'Name, surname, email, and campus are required' }, { status: 400 });
  }

  const campusId = body.campus as CampusId;

  const { data: existing } = await db
    .from('invite_requests')
    .select('*')
    .eq('email', email)
    .eq('status', 'pending')
    .maybeSingle();

  if (existing) {
    return NextResponse.json(mapInviteRequest(existing));
  }

  const { data, error } = await db
    .from('invite_requests')
    .insert({
      surname: body.surname.trim(),
      full_name: body.fullName.trim(),
      email,
      campus_id: campusId,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  void notifyCampusAdmins(campusId, `${body.fullName.trim()} ${body.surname.trim()}`, email, request);

  return NextResponse.json(mapInviteRequest(data));
}
