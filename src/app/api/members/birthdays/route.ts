import { NextResponse } from 'next/server';
import { shouldHideFromMemberDirectory } from '@/lib/auth/super-admin';
import { churchIdFromUrl } from '@/lib/church/tenant';
import { requireSessionChurch } from '@/lib/auth/session-church';
import {
  canUsePastoralStaffTools,
  readSessionEmailHeader,
  resolveStaffActor,
} from '@/lib/auth/staff-access-server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

function isBirthdayToday(dateOfBirth: string | null): boolean {
  if (!dateOfBirth) return false;
  const dob = new Date(`${dateOfBirth}T12:00:00`);
  if (Number.isNaN(dob.getTime())) return false;
  const today = new Date();
  return dob.getMonth() === today.getMonth() && dob.getDate() === today.getDate();
}

export async function GET(request: Request) {
  const denied = await requireSessionChurch(request, churchIdFromUrl(request.url));
  if (denied) return denied;

  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const { data, error } = await db
    .from('members')
    .select('full_name, surname, phone, email, campus_id, date_of_birth, status')
    .eq('church_id', churchIdFromUrl(request.url))
    .eq('status', 'active');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const visible = (data ?? []).filter(
    (row) =>
      !shouldHideFromMemberDirectory({ email: row.email, phone: row.phone }) &&
      isBirthdayToday(row.date_of_birth),
  );

  const actor = await resolveStaffActor(request);
  const email = readSessionEmailHeader(request);
  const { data: profile } = await db
    .from('profiles')
    .select('phone')
    .ilike('email', email)
    .eq('church_id', churchIdFromUrl(request.url))
    .maybeSingle();
  const sessionDigits = (profile?.phone ?? '').replace(/\D/g, '');
  const myRow = visible.find((row) => row.phone.replace(/\D/g, '') === sessionDigits) ?? null;

  if (!actor || !canUsePastoralStaffTools(actor)) {
    return NextResponse.json({
      celebrants: [],
      myBirthday: Boolean(myRow),
      myFirstName: myRow?.full_name?.split(/\s+/)[0] ?? null,
    });
  }

  const celebrants = visible.map((row) => ({
    name: `${row.full_name} ${row.surname}`.trim(),
    campusId: row.campus_id,
    phone: row.phone,
  }));

  return NextResponse.json({
    celebrants,
    myBirthday: Boolean(myRow),
    myFirstName: myRow?.full_name?.split(/\s+/)[0] ?? null,
  });
}
