import { NextResponse } from 'next/server';
import {
  canEditMembershipSettings,
  resolveStaffActor,
} from '@/lib/auth/staff-access-server';
import { churchIdForSessionEmail } from '@/lib/auth/session-church';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const SETTINGS_COLUMNS =
  'id, membership_duration_days, renewal_reminder_days, renewal_final_days, auto_approve_renewals, grace_period_days';

function mapRow(row: {
  id: string;
  membership_duration_days: number;
  renewal_reminder_days: number;
  renewal_final_days: number;
  auto_approve_renewals: boolean;
  grace_period_days: number;
}) {
  return {
    churchId: row.id,
    membershipDurationDays: row.membership_duration_days,
    renewalReminderDays: row.renewal_reminder_days,
    renewalFinalDays: row.renewal_final_days,
    autoApproveRenewals: row.auto_approve_renewals,
    gracePeriodDays: row.grace_period_days,
  };
}

function parseNonNegInt(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(n) || n < 0) return null;
  return n;
}

export async function GET(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const actor = await resolveStaffActor(request);
  if (!actor || !canEditMembershipSettings(actor)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const churchId = await churchIdForSessionEmail(request);
  if (!churchId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data, error } = await db.from('churches').select(SETTINGS_COLUMNS).eq('id', churchId).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(mapRow(data));
}

export async function PATCH(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const actor = await resolveStaffActor(request);
  if (!actor || !canEditMembershipSettings(actor)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const churchId = await churchIdForSessionEmail(request);
  if (!churchId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  const membershipDurationDays = parseNonNegInt(body.membershipDurationDays);
  const renewalReminderDays = parseNonNegInt(body.renewalReminderDays);
  const renewalFinalDays = parseNonNegInt(body.renewalFinalDays);
  const gracePeriodDays = parseNonNegInt(body.gracePeriodDays);
  const autoApproveRenewals = body.autoApproveRenewals;

  if (
    membershipDurationDays == null ||
    renewalReminderDays == null ||
    renewalFinalDays == null ||
    gracePeriodDays == null ||
    typeof autoApproveRenewals !== 'boolean'
  ) {
    return NextResponse.json({ error: 'Invalid membership settings' }, { status: 400 });
  }

  const { data, error } = await db
    .from('churches')
    .update({
      membership_duration_days: membershipDurationDays,
      renewal_reminder_days: renewalReminderDays,
      renewal_final_days: renewalFinalDays,
      auto_approve_renewals: autoApproveRenewals,
      grace_period_days: gracePeriodDays,
      updated_at: new Date().toISOString(),
    })
    .eq('id', churchId)
    .select(SETTINGS_COLUMNS)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(mapRow(data));
}
