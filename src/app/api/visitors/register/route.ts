import { NextResponse } from 'next/server';
import { normalizeEmail } from '@/lib/auth/super-admin';
import { normalizePhone } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const body = await request.json();
  const givenName = String(body.givenName ?? '').trim();
  const surname = String(body.surname ?? '').trim();
  const email = normalizeEmail(String(body.email ?? ''));
  const phone = normalizePhone(String(body.phone ?? ''));
  const gender = body.gender === 'Male' || body.gender === 'Female' ? body.gender : null;
  const maritalStatus = String(body.maritalStatus ?? '').trim() || null;
  const acceptedJesus = body.acceptedJesus === true ? true : body.acceptedJesus === false ? false : null;
  const wantsToJoinChurch =
    body.wantsToJoinChurch === true ? true : body.wantsToJoinChurch === false ? false : null;
  const eventNewsConsent = Boolean(body.eventNewsConsent);
  const campusId = String(body.campusId ?? 'midrand').trim() || 'midrand';

  if (!givenName || !surname) {
    return NextResponse.json({ error: 'Name and surname are required.' }, { status: 400 });
  }
  if (!email.includes('@')) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
  }
  if (phone.length < 9) {
    return NextResponse.json({ error: 'A valid phone number is required.' }, { status: 400 });
  }
  if (!gender) {
    return NextResponse.json({ error: 'Please select gender.' }, { status: 400 });
  }
  if (!maritalStatus) {
    return NextResponse.json({ error: 'Please select marital status.' }, { status: 400 });
  }
  if (acceptedJesus === null || wantsToJoinChurch === null) {
    return NextResponse.json({ error: 'Please answer the faith questions.' }, { status: 400 });
  }

  const fullName = `${givenName} ${surname}`.trim();

  const { data: existing } = await db
    .from('visitors')
    .select('id')
    .ilike('email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const payload = {
    name: fullName,
    surname,
    phone,
    email,
    campus_id: campusId,
    source: 'event_signup',
    gender,
    marital_status: maritalStatus,
    accepted_jesus: acceptedJesus,
    wants_to_join_church: wantsToJoinChurch,
    event_news_consent: eventNewsConsent,
    notes: JSON.stringify({
      givenName,
      acceptedJesus,
      wantsToJoinChurch,
      eventNewsConsent,
    }),
  };

  if (existing?.id) {
    const { data, error } = await db
      .from('visitors')
      .update(payload)
      .eq('id', existing.id)
      .select('id, name, email, phone')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ visitor: data, updated: true });
  }

  const { data, error } = await db
    .from('visitors')
    .insert(payload)
    .select('id, name, email, phone')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ visitor: data, updated: false });
}
