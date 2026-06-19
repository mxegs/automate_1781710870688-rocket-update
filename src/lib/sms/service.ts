import { formatPhoneDisplay } from '@/lib/auth/session';

export interface SendSmsResult {
  success: boolean;
  messageId?: string;
  demo?: boolean;
  error?: string;
}

/** Demo SMS provider — swap for Twilio / Africa's Talking / Supabase Edge Function in production */
export async function sendSms(phone: string, message: string): Promise<SendSmsResult> {
  const provider = process.env.NEXT_PUBLIC_SMS_PROVIDER ?? 'demo';

  if (provider === 'demo' || typeof window !== 'undefined') {
    console.info('[CKC SMS demo]', formatPhoneDisplay(phone), message);
    return { success: true, messageId: `demo_${Date.now()}`, demo: true };
  }

  // Server-side production hook (wire when Supabase Edge Function is ready)
  return { success: false, error: 'SMS provider not configured' };
}

export function buildInviteSmsMessage(name: string, inviteUrl: string): string {
  return `Hi ${name}, you've been invited to join Christ Kingdom Citizens. Complete your membership here: ${inviteUrl}`;
}

export function buildOtpSmsMessage(code: string): string {
  return `Your CKC sign-in code is ${code}. Valid for 10 minutes. Do not share this code.`;
}
