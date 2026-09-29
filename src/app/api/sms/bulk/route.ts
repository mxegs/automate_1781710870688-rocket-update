import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { notFoundResponse, requireSessionChurchId } from '@/lib/auth/session-church';
import { sendBulkSms } from '@/lib/sms/service';

function ageCategoryToRange(category: string): { min?: number; max?: number } {
  if (category === 'child') return { max: 12 };
  if (category === 'youth') return { min: 13, max: 25 };
  if (category === 'adult') return { min: 26 };
  return {};
}

export async function POST(request: Request) {
  const churchId = await requireSessionChurchId(request);
  if (churchId instanceof NextResponse) return churchId;

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const body = await request.json();
  const message = body.message?.trim();
  if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

  let query = db
    .from('members')
    .select('id, phone, full_name, campus_id, gender, age, status')
    .eq('status', 'active')
    .eq('church_id', churchId);

  if (body.campusId && body.campusId !== 'all') {
    query = query.eq('campus_id', body.campusId);
  }
  if (body.gender && body.gender !== 'all') {
    query = query.eq('gender', body.gender);
  }
  if (body.ageCategory && body.ageCategory !== 'all') {
    const { min, max } = ageCategoryToRange(body.ageCategory);
    if (min != null) query = query.gte('age', min);
    if (max != null) query = query.lte('age', max);
  }
  if (body.memberIds?.length) {
    const ids = body.memberIds as string[];
    query = query.in('id', ids);
    const { data: members, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if ((members ?? []).length !== ids.length) return notFoundResponse();
    return finishSms(body.dryRun, members ?? [], message);
  }

  const { data: members, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return finishSms(body.dryRun, members ?? [], message);
}

async function finishSms(
  dryRun: unknown,
  members: { id: string; phone: string; full_name: string; campus_id: string }[],
  message: string,
) {
  const phones = members.map((m) => m.phone).filter(Boolean);

  if (dryRun) {
    return NextResponse.json({
      count: phones.length,
      recipients: members.map((m) => ({
        id: m.id,
        name: m.full_name,
        phone: m.phone,
        campus: m.campus_id,
      })),
    });
  }

  const result = await sendBulkSms(phones, message);
  return NextResponse.json({
    ...result,
    total: phones.length,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const body = {
    campusId: searchParams.get('campusId') ?? 'all',
    gender: searchParams.get('gender') ?? 'all',
    ageCategory: searchParams.get('ageCategory') ?? 'all',
    message: 'preview',
    dryRun: true,
  };

  const fakeRequest = new Request(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify(body),
  });
  return POST(fakeRequest);
}
