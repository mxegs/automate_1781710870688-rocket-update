import { apiFetch, useBackend } from '@/lib/api/client';
import { isSuperAdminEmail, normalizeEmail } from '@/lib/auth/super-admin';

export interface SendEmailOtpResult {
  demo: boolean;
}

export async function sendEmailOtp(email: string): Promise<SendEmailOtpResult> {
  if (!useBackend()) {
    throw new Error('Email sign-in requires the backend.');
  }
  const res = await apiFetch<{ ok: boolean; demo?: boolean }>('/api/auth/email-otp/send', {
    method: 'POST',
    body: JSON.stringify({ email: normalizeEmail(email) }),
  });
  return { demo: res.demo ?? false };
}

export async function verifyEmailOtp(email: string, code: string): Promise<boolean> {
  if (!useBackend()) return false;
  try {
    await apiFetch('/api/auth/email-otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email: normalizeEmail(email), code }),
    });
    return true;
  } catch {
    return false;
  }
}

export { isSuperAdminEmail, normalizeEmail };
