import { formatPhoneDisplay, normalizePhone } from '@/lib/auth/session';
import { isInternalPlaceholderPhone } from '@/lib/auth/super-admin';
import { getBulkSmsAuthHeader } from '@/lib/sms/bulksms-auth';

export interface SendSmsResult {
  success: boolean;
  messageId?: string;
  demo?: boolean;
  error?: string;
}

export interface BulkSmsResult {
  sent: number;
  failed: number;
  demo?: boolean;
  errors?: string[];
}

function getProvider(): string {
  return process.env.SMS_PROVIDER ?? process.env.NEXT_PUBLIC_SMS_PROVIDER ?? 'demo';
}

function formatE164(phone: string): string {
  const digits = normalizePhone(phone);
  if (digits.startsWith('27')) return `+${digits}`;
  if (digits.startsWith('0') && digits.length === 10) return `+27${digits.slice(1)}`;
  if (digits.length === 9) return `+27${digits}`;
  return digits.startsWith('+') ? digits : `+${digits}`;
}

/** BulkSMS.com — https://www.bulksms.com/developer/json/v1/ */
async function sendViaBulkSms(phones: string[], message: string): Promise<BulkSmsResult> {
  const auth = getBulkSmsAuthHeader();
  if (!auth) {
    return {
      sent: 0,
      failed: phones.length,
      errors: [
        'BulkSMS not configured — set BULKSMS_TOKEN_ID + BULKSMS_TOKEN_SECRET (or BULKSMS_BASIC_AUTH) in .env',
      ],
    };
  }

  const to = phones.map(formatE164);

  const res = await fetch('https://api.bulksms.com/v1/messages', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: auth,
    },
    body: JSON.stringify({
      to: to.length === 1 ? to[0] : to,
      body: message,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail =
      (data as { detail?: string })?.detail ??
      (data as { title?: string })?.title ??
      res.statusText;
    return { sent: 0, failed: phones.length, errors: [detail] };
  }

  const items = Array.isArray(data) ? data : [data];
  const sent = items.filter((item) => item && (item.id || item.status === 'ACCEPTED')).length;
  return { sent: sent || phones.length, failed: Math.max(0, phones.length - (sent || phones.length)) };
}

async function sendViaAfricasTalking(phones: string[], message: string): Promise<BulkSmsResult> {
  const username = process.env.AFRICAS_TALKING_USERNAME;
  const apiKey = process.env.AFRICAS_TALKING_API_KEY;

  if (!username || !apiKey) {
    return {
      sent: 0,
      failed: phones.length,
      errors: ["Africa's Talking not configured — set AFRICAS_TALKING_USERNAME and AFRICAS_TALKING_API_KEY in .env"],
    };
  }

  const body = new URLSearchParams();
  body.set('username', username);
  body.set('message', message);
  for (const phone of phones) {
    body.append('to', formatE164(phone));
  }

  const res = await fetch('https://api.africastalking.com/version1/messaging', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      apiKey,
    },
    body: body.toString(),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { sent: 0, failed: phones.length, errors: [data?.SMSMessageData?.Message ?? res.statusText] };
  }

  const recipients = data?.SMSMessageData?.Recipients ?? [];
  const sent = recipients.filter((r: { status: string }) => r.status === 'Success').length;
  return { sent, failed: recipients.length - sent };
}

/** Send a single SMS (server-side). Client calls should go through /api/sms/bulk or other API routes. */
export async function sendSms(phone: string, message: string): Promise<SendSmsResult> {
  if (isInternalPlaceholderPhone(phone)) {
    console.info('[CKC SMS skipped internal phone]', phone, message);
    return { success: true, messageId: `skipped_${Date.now()}`, demo: true };
  }

  const provider = getProvider();

  if (typeof window === 'undefined' && provider === 'bulksms') {
    const result = await sendViaBulkSms([phone], message);
    if (result.sent > 0) return { success: true, messageId: `bulksms_${Date.now()}` };
    return { success: false, error: result.errors?.[0] ?? 'SMS failed' };
  }

  if (typeof window === 'undefined' && provider === 'africas_talking') {
    const result = await sendViaAfricasTalking([phone], message);
    if (result.sent > 0) return { success: true, messageId: `at_${Date.now()}` };
    return { success: false, error: result.errors?.[0] ?? 'SMS failed' };
  }

  if (provider === 'demo' || typeof window !== 'undefined') {
    console.info('[CKC SMS demo]', formatPhoneDisplay(phone), message);
    return { success: true, messageId: `demo_${Date.now()}`, demo: true };
  }

  return { success: false, error: 'SMS provider not configured' };
}

/** Bulk SMS to multiple numbers (server-side only) */
export async function sendBulkSms(phones: string[], message: string): Promise<BulkSmsResult> {
  const unique = [...new Set(phones.map(normalizePhone).filter((p) => p.length >= 9 && !isInternalPlaceholderPhone(p)))];
  if (unique.length === 0) {
    return { sent: 0, failed: 0, errors: ['No valid phone numbers'] };
  }

  const provider = getProvider();

  if (provider === 'bulksms') {
    return sendViaBulkSms(unique, message);
  }

  if (provider === 'africas_talking') {
    return sendViaAfricasTalking(unique, message);
  }

  for (const phone of unique) {
    console.info('[CKC SMS demo bulk]', formatPhoneDisplay(phone), message);
  }
  return { sent: unique.length, failed: 0, demo: true };
}

export function buildInviteSmsMessage(name: string, inviteUrl: string): string {
  return `Hi ${name}, you've been invited to join Christ Kingdom Citizens. Complete your membership here: ${inviteUrl}`;
}

export function buildInviteRequestNotifyMessage(
  fullName: string,
  email: string,
  campusLabel: string,
  membersUrl: string,
): string {
  return `CKC: ${fullName} (${email}) requested membership at ${campusLabel}. Review: ${membersUrl}`;
}
