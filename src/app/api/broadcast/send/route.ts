import { NextResponse } from 'next/server';
import { resolveBroadcastAudience, type BroadcastFilters } from '@/lib/broadcast/audience';
import { sendMailchimpBroadcast } from '@/lib/email/mailchimp';
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
  const paragraphs = body
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 12px;line-height:1.5;">${p.replace(/</g, '&lt;')}</p>`)
    .join('');

  return `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
      <h1 style="font-size:22px;color:#c9a227;margin-bottom:16px;">${subject.replace(/</g, '&lt;')}</h1>
      ${paragraphs}
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
      <p style="font-size:12px;color:#888;">Christ Kingdom Citizens</p>
    </div>
  `;
}

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const body = await request.json();
  const channel = body.channel as 'sms' | 'email';
  const message = String(body.message ?? '').trim();
  const subject = String(body.subject ?? 'Message from CKC').trim();

  if (!channel || !message) {
    return NextResponse.json({ error: 'Channel and message are required' }, { status: 400 });
  }

  const filters = parseFilters(body);

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
