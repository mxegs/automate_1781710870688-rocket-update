import { NextResponse } from 'next/server';
import { resolveBroadcastAudience, type BroadcastFilters } from '@/lib/broadcast/audience';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

function parseFilters(body: Record<string, unknown>): BroadcastFilters {
  return {
    audienceType: (body.audienceType as BroadcastFilters['audienceType']) ?? 'members',
    campusId: (body.campusId as BroadcastFilters['campusId']) ?? 'all',
    gender: (body.gender as BroadcastFilters['gender']) ?? 'all',
    ageCategory: (body.ageCategory as BroadcastFilters['ageCategory']) ?? 'all',
    groupId: body.groupId as string | undefined,
  };
}

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const body = await request.json();
  const filters = parseFilters(body);

  try {
    const recipients = await resolveBroadcastAudience(db, filters);
    const withPhone = recipients.filter((r) => r.phone);
    const withEmail = recipients.filter((r) => r.email?.includes('@'));

    return NextResponse.json({
      count: recipients.length,
      smsCount: withPhone.length,
      emailCount: withEmail.length,
      recipients: recipients.map((r) => ({
        id: r.id,
        name: r.name,
        phone: r.phone,
        email: r.email,
        campus: r.campus,
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Preview failed' },
      { status: 500 },
    );
  }
}
