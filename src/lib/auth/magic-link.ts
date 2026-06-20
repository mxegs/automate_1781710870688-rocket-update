import { apiFetch, useBackend } from '@/lib/api/client';
import { normalizeEmail } from '@/lib/auth/super-admin';

export interface SendMagicLinkResult {
  demo: boolean;
}

export async function sendMagicLink(
  email: string,
  options?: { allowVisitor?: boolean },
): Promise<SendMagicLinkResult & { demoLink?: string }> {
  if (!useBackend()) {
    throw new Error('Email sign-in requires the backend.');
  }
  const res = await apiFetch<{ ok: boolean; demo?: boolean; demoLink?: string }>(
    '/api/auth/magic-link/send',
    {
      method: 'POST',
      body: JSON.stringify({
        email: normalizeEmail(email),
        allowVisitor: options?.allowVisitor === true,
      }),
    },
  );
  return { demo: res.demo ?? false, demoLink: res.demoLink };
}

export async function verifyMagicLink(token: string): Promise<{
  email: string;
  allowVisitor: boolean;
}> {
  return apiFetch('/api/auth/magic-link/verify', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}
