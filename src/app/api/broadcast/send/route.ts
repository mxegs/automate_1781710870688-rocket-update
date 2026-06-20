import { NextResponse } from 'next/server';
import { enforceBroadcastFilters } from '@/lib/broadcast/access-server';
import { resolveBroadcastAudience, type BroadcastFilters } from '@/lib/broadcast/audience';
import { resolveStaffActor } from '@/lib/auth/staff-access-server';
import { sendMailchimpBroadcast, buildBroadcastEmailHtml } from '@/lib/email/mailchimp';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { sendBulkSms } from '@/lib/sms/service';

function parseFilters(body: Record<string, unknown>): BroadcastFilters {
  return {
    audienceType: (body.audienceType as BroadcastFilters['audienceType']) ?? 'members',
    campusId: (body.campusId as BroadcastFilters['campusId']) ?? 'all',
    gender: (body.gender as BroadcastFilters['gender']) ?? 'all',
    ageCategory: (body.ageCategory as BroadcastFilters['ageCategory']) ?? 'all',
    groupId: body.groupId as string | undefined,
  };
}

function wrapEmailHtml(subject: string, body: string): string {
  return buildBroadcastEmailHtml(subject, body);
}

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const actor = await resolveStaffActor(request);
  if (!actor) {
    return NextResponse.json({ error: 'Staff sign-in required' }, { status: 401 });
  }

  const body = await request.json();
  const channel = body.channel as 'sms' | 'email';
  const message = String(body.message ?? '').trim();
  const subject = String(body.subject ?? 'Message from CKC').trim();

  if (!channel || !message) {
    return NextResponse.json({ error: 'Channel and message are required' }, { status: 400 });
  }

  const parsed = parseFilters(body);
  const enforced = await enforceBroadcastFilters(db, actor, parsed);
  if ('error' in enforced) {
    return NextResponse.json({ error: enforced.error }, { status: enforced.status });
  }

  const filters = enforced.filters;

  try {
    const recipients = await resolveBroadcastAudience(db, filters);

    if (channel === 'sms') {
      const phones = recipients.map((r) => r.phone).filter(Boolean);
      const result = await sendBulkSms(phones, message);
      return NextResponse.json({
        channel: 'sms',
        total: phones.length,
        ...result,
      });
    }

    if (channel === 'email') {
      const emailRecipients = recipients
        .filter((r) => r.email?.includes('@'))
        .map((r) => ({ email: r.email!, name: r.name }));

      const result = await sendMailchimpBroadcast({
        subject,
        html: wrapEmailHtml(subject, message),
        plainText: message,
        recipients: emailRecipients,
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error ?? 'Email send failed' }, { status: 502 });
      }

      return NextResponse.json({
        channel: 'email',
        total: emailRecipients.length,
        sent: result.sent ?? emailRecipients.length,
        campaignId: result.campaignId,
        demo: result.demo,
        warnings: result.warnings,
      });
    }

    return NextResponse.json({ error: 'Invalid channel' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Send failed' },
      { status: 500 },
    );
  }
}
