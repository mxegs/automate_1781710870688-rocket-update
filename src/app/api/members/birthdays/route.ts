import { NextResponse } from 'next/server';
import { shouldHideFromMemberDirectory } from '@/lib/auth/super-admin';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

function isBirthdayToday(dateOfBirth: string | null): boolean {
  if (!dateOfBirth) return false;
  const dob = new Date(`${dateOfBirth}T12:00:00`);
  if (Number.isNaN(dob.getTime())) return false;
  const today = new Date();
  return dob.getMonth() === today.getMonth() && dob.getDate() === today.getDate();
}

export async function GET(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone')?.replace(/\D/g, '') ?? '';

  const { data, error } = await db
    .from('members')
    .select('full_name, surname, phone, email, campus_id, date_of_birth, status')
    .eq('status', 'active');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const visible = (data ?? []).filter(
    (row) =>
      !shouldHideFromMemberDirectory({ email: row.email, phone: row.phone }) &&
      isBirthdayToday(row.date_of_birth),
  );

  const celebrants = visible.map((row) => ({
    name: `${row.full_name} ${row.surname}`.trim(),
    campusId: row.campus_id,
    phone: row.phone,
  }));

  const myRow = phone
    ? visible.find((row) => row.phone.replace(/\D/g, '') === phone)
    : null;

  return NextResponse.json({
    celebrants,
    myBirthday: Boolean(myRow),
    myFirstName: myRow?.full_name?.split(/\s+/)[0] ?? null,
  });
}
