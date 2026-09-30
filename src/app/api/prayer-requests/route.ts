import { NextResponse } from 'next/server';
import { churchIdFromUrl } from '@/lib/church/tenant';
import { notFoundResponse, requireSessionChurch } from '@/lib/auth/session-church';
import {
  canReviewPrayerInbox,
  readSessionEmailHeader,
  resolveStaffActor,
} from '@/lib/auth/staff-access-server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { PRAYER_AUTO_REPLY } from '@/lib/prayer/types';
import type { PrayerRequest, PrayerStatus } from '@/lib/prayer/types';
import { sendSms } from '@/lib/sms/service';

function mapRow(row: Record<string, unknown>): PrayerRequest {
  return {
    id: row.id as string,
    campus: row.campus_id as PrayerRequest['campus'],
    submitterName: row.submitter_name as string,
    contactPhone: (row.contact_phone as string) ?? undefined,
    contactEmail: (row.contact_email as string) ?? undefined,
    title: row.title as string,
    description: row.description as string,
    category: row.category as string,
    isConfidential: Boolean(row.is_confidential),
    status: row.status as PrayerStatus,
    date: new Date(row.created_at as string).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
  };
}

export async function GET(request: Request) {
  const churchId = churchIdFromUrl(request.url);
  const denied = await requireSessionChurch(request, churchId);
  if (denied) return denied;

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const campusId = searchParams.get('campusId');
  const allCampuses = searchParams.get('allCampuses') === 'true';
  const status = searchParams.get('status');

  const actor = await resolveStaffActor(request);
  const inboxStaff = Boolean(actor && canReviewPrayerInbox(actor));

  let query = db
    .from('prayer_requests')
    .select('*')
    .eq('church_id', churchId)
    .order('created_at', { ascending: false });

  if (!inboxStaff) {
    const email = readSessionEmailHeader(request);
    const { data: profile } = await db.from('profiles').select('id').ilike('email', email).maybeSingle();
    const profileId = (profile as { id?: string } | null)?.id?.trim();
    if (!profileId) return notFoundResponse();
    query = query.eq('profile_id', profileId);
  }

  if (!allCampuses && campusId) {
    query = query.eq('campus_id', campusId);
  }
  if (status) {
    query = query.eq('status', status as PrayerStatus);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(mapRow));
}

export async function POST(request: Request) {
  const churchId = churchIdFromUrl(request.url);
  const denied = await requireSessionChurch(request, churchId);
  if (denied) return denied;

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const body = await request.json();
  if (!body.title?.trim() || !body.description?.trim() || !body.campus) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!body.contactPhone?.trim() && !body.contactEmail?.trim()) {
    return NextResponse.json({ error: 'Phone or email required' }, { status: 400 });
  }

  const { data, error } = await db
    .from('prayer_requests')
    .insert({
      campus_id: body.campus,
      church_id: churchId,
      profile_id: body.profileId || null,
      submitter_name: body.submitterName?.trim() || 'Member',
      contact_phone: body.contactPhone?.trim() || null,
      contact_email: body.contactEmail?.trim() || null,
      title: body.title.trim(),
      description: body.description.trim(),
      category: body.category ?? 'Other',
      is_confidential: Boolean(body.isConfidential),
      auto_reply_sent_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (body.contactPhone) {
    await sendSms(body.contactPhone, PRAYER_AUTO_REPLY);
  }

  return NextResponse.json({ request: mapRow(data), autoReply: PRAYER_AUTO_REPLY });
}
