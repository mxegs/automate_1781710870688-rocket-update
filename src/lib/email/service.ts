export interface SendEmailResult {
  success: boolean;
  demo?: boolean;
  error?: string;
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

export function buildInviteEmailHtml(officialName: string, inviteUrl: string): string {
  const firstName = officialName.trim().split(/\s+/)[0] || officialName;
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;">
      <h2 style="color:#c9a227;">Christ Kingdom Citizens</h2>
      <p>Hi ${firstName},</p>
      <p>You've been invited to complete your CKC membership registration.</p>
      <p style="margin:24px 0;">
        <a href="${inviteUrl}" style="background:#c9a227;color:#000;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">
          Complete registration
        </a>
      </p>
      <p style="font-size:14px;color:#666;">Or copy this link: ${inviteUrl}</p>
      <p style="font-size:12px;color:#888;">Open the link to complete your membership form. Your cell number is collected there for church SMS updates.</p>
    </div>
  `;
}

export async function sendInviteEmail(
  to: string,
  officialName: string,
  inviteUrl: string,
): Promise<SendEmailResult> {
  const subject = 'Your CKC membership invite';
  const html = buildInviteEmailHtml(officialName, inviteUrl);
  const provider = process.env.EMAIL_PROVIDER ?? 'resend';

  if (provider === 'demo') {
    console.info('[CKC Email demo invite]', to, inviteUrl);
    return { success: true, demo: true };
  }

  return sendViaResend(to, subject, html);
}

function buildMagicLinkEmailHtml(signInUrl: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #c9a227;">Christ Kingdom Citizens</h2>
      <p>Tap the button below to sign in. No password needed.</p>
      <p style="margin: 24px 0;">
        <a href="${signInUrl}" style="background:#c9a227;color:#000;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">
          Sign in to CKC
        </a>
      </p>
      <p style="font-size:14px;color:#666;">Or copy this link: ${signInUrl}</p>
      <p style="font-size:12px;color:#888;">This link expires in 30 minutes.</p>
    </div>
  `;
}

/** Send one-click sign-in link (server-side only) */
export async function sendMagicLinkEmail(to: string, signInUrl: string): Promise<SendEmailResult> {
  const subject = 'Your CKC sign-in link';
  const html = buildMagicLinkEmailHtml(signInUrl);
  const provider = process.env.EMAIL_PROVIDER ?? 'resend';

  if (provider === 'demo') {
    console.info('[CKC Email demo magic link]', to, signInUrl);
    return { success: true, demo: true };
  }

  const result = await sendViaResend(to, subject, html);
  if (result.success) return result;

  console.info('[CKC Email fallback magic link]', to, signInUrl, result.error);
  return { success: true, demo: true };
}
