import type { SupabaseClient } from '@supabase/supabase-js';
import { normalizeEmail } from '@/lib/auth/super-admin';

export type EmailOtpPurpose = 'login' | 'invite';

export async function resolveEmailOtpPurpose(
  db: SupabaseClient,
  email: string,
  options?: { inviteToken?: string | null; allowVisitor?: boolean },
): Promise<{ ok: true; purpose: EmailOtpPurpose } | { ok: false; error: string }> {
  const normalized = normalizeEmail(email);
  if (!normalized.includes('@')) {
    return { ok: false, error: 'Invalid email address' };
  }

  const inviteToken = options?.inviteToken;

  if (inviteToken) {
    const { data: invite } = await db
      .from('invites')
      .select('email, status')
      .eq('token', inviteToken)
      .eq('status', 'pending')
      .maybeSingle();

    if (!invite) {
      return { ok: false, error: 'Invite link is invalid or expired' };
    }
    if (!invite.email) {
      return { ok: false, error: 'This invite has no email — ask admin to resend the invite' };
    }
    if (normalizeEmail(invite.email) !== normalized) {
      return { ok: false, error: 'Email does not match this invite' };
    }
    return { ok: true, purpose: 'invite' };
  }

  const { data: profile } = await db
    .from('profiles')
    .select('email, role')
    .ilike('email', normalized)
    .maybeSingle();

  if (profile?.email && profile.role !== 'visitor') {
    return { ok: true, purpose: 'login' };
  }

  if (options?.allowVisitor) {
    return { ok: true, purpose: 'login' };
  }

  return {
    ok: false,
    error:
      'This email is not registered yet. Request membership or use your invite link from email.',
  };
}
