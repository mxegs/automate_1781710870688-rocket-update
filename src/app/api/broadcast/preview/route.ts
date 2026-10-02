import { NextResponse } from 'next/server';
import { enforceBroadcastFilters } from '@/lib/broadcast/access-server';
import {
  BroadcastAudienceNotFoundError,
  resolveBroadcastAudience,
  type BroadcastFilters,
} from '@/lib/broadcast/audience';
import { churchIdForSessionEmail } from '@/lib/auth/session-church';
import { resolveStaffActor } from '@/lib/auth/staff-access-server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

function notFound() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

function parseFilters(body: Record<string, unknown>, churchId: string): BroadcastFilters {
  return {
    churchId,
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

  const actor = await resolveStaffActor(request);
  if (!actor) return notFound();

  const sessionChurchId = await churchIdForSessionEmail(request);
  if (!sessionChurchId) return notFound();

  const body = await request.json();
  const bodyChurchId = typeof body.churchId === 'string' ? body.churchId.trim() : '';
  if (bodyChurchId && bodyChurchId !== sessionChurchId) return notFound();

  const parsed = parseFilters(body, sessionChurchId);
  const enforced = await enforceBroadcastFilters(db, actor, parsed);
  if ('error' in enforced) {
    return NextResponse.json({ error: enforced.error }, { status: enforced.status });
  }

  try {
    const recipients = await resolveBroadcastAudience(db, enforced.filters);
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
    if (err instanceof BroadcastAudienceNotFoundError) return notFound();
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Preview failed' },
      { status: 500 },
    );
  }
}
