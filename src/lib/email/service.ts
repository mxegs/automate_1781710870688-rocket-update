export interface SendEmailResult {
  success: boolean;
  demo?: boolean;
  error?: string;
}

function buildOtpEmailHtml(code: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1a1a1a;">Christ Kingdom Citizens</h2>
      <p>Your sign-in code is:</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #c9a227;">${code}</p>
      <p style="color: #666; font-size: 14px;">Valid for 10 minutes. Do not share this code.</p>
    </div>
  `;
}

async function sendViaResend(to: string, subject: string, html: string): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  const from = process.env.EMAIL_FROM?.trim() ?? 'CKC Church <onboarding@resend.dev>';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      success: false,
      error: (data as { message?: string })?.message ?? res.statusText,
    };
  }

  return { success: true };
}

/** Send OTP email (server-side only) */
export async function sendOtpEmail(to: string, code: string): Promise<SendEmailResult> {
  const subject = 'Your CKC sign-in code';
  const html = buildOtpEmailHtml(code);

  const provider = process.env.EMAIL_PROVIDER ?? 'resend';

  if (provider === 'demo') {
    console.info('[CKC Email demo]', to, `OTP: ${code}`);
    return { success: true, demo: true };
  }

  const result = await sendViaResend(to, subject, html);
  if (result.success) return result;

  console.info('[CKC Email fallback]', to, `OTP: ${code}`, result.error);
  return { success: true, demo: true };
}

export function buildInviteRequestNotifyEmailHtml(
  fullName: string,
  phone: string,
  campusLabel: string,
  membersUrl: string,
): string {
  return `
    <div style="font-family: sans-serif; max-width: 520px;">
      <h2>New membership invite request</h2>
      <p><strong>${fullName}</strong> (${phone}) requested an invite at <strong>${campusLabel}</strong>.</p>
      <p><a href="${membersUrl}">Review pending requests in admin</a></p>
    </div>
  `;
}

export async function sendAdminNotifyEmail(
  to: string,
  subject: string,
  html: string,
): Promise<SendEmailResult> {
  const provider = process.env.EMAIL_PROVIDER ?? 'resend';
  if (provider === 'demo') {
    console.info('[CKC Email demo notify]', to, subject);
    return { success: true, demo: true };
  }
  return sendViaResend(to, subject, html);
}
