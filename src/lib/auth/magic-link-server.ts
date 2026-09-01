import { createHash, randomBytes } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { normalizeEmail } from '@/lib/auth/super-admin';

const LINK_TTL_MS = 30 * 60 * 1000;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function generateToken(): string {
  return randomBytes(32).toString('base64url');
}

/** Create a one-time magic link token stored in Supabase. */
export async function issueMagicLink(
  db: SupabaseClient,
  email: string,
  allowVisitor: boolean,
): Promise<string> {
  const normalized = normalizeEmail(email);
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + LINK_TTL_MS).toISOString();

  // Drop any older unused links for this email (keeps inbox links simpler)
  await db.from('magic_link_tokens').delete().ilike('email', normalized);

  const { error } = await db.from('magic_link_tokens').insert({
    token_hash: tokenHash,
    email: normalized,
    allow_visitor: allowVisitor,
    expires_at: expiresAt,
  });

  if (error) {
    throw new Error(
      error.message.includes('magic_link_tokens') || error.code === '42P01' || error.code === 'PGRST205'
        ? 'Magic link storage is not set up. Run migration 20250812100000_magic_link_tokens.sql in Supabase.'
        : error.message,
    );
  }

  return token;
}

/** Consume a one-time magic link token. Returns null if missing/expired. */
export async function consumeMagicLink(
  db: SupabaseClient,
  token: string,
): Promise<{ email: string; allowVisitor: boolean } | null> {
  const tokenHash = hashToken(token.trim());
  if (!tokenHash) return null;

  const { data, error } = await db
    .from('magic_link_tokens')
    .delete()
    .eq('token_hash', tokenHash)
    .gt('expires_at', new Date().toISOString())
    .select('email, allow_visitor')
    .maybeSingle();

  if (error || !data) return null;

  return {
    email: normalizeEmail(data.email),
    allowVisitor: Boolean(data.allow_visitor),
  };
}

/** Optional cleanup of expired tokens (safe to call occasionally). */
export async function purgeExpiredMagicLinks(db: SupabaseClient): Promise<void> {
  await db.from('magic_link_tokens').delete().lte('expires_at', new Date().toISOString());
}
