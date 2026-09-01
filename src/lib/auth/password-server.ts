import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import type { SupabaseClient } from '@supabase/supabase-js';

const scryptAsync = promisify(scrypt);

const MIN_PASSWORD_LENGTH = 8;
const SETUP_TTL_MS = 30 * 60 * 1000;

export function validatePasswordStrength(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const hashBuf = Buffer.from(hash, 'hex');
  if (derived.length !== hashBuf.length) return false;
  return timingSafeEqual(derived, hashBuf);
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function generateToken(): string {
  return randomBytes(32).toString('base64url');
}

function getSigningSecret(): string {
  return (
    process.env.PASSWORD_RESET_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    'ckc-dev-password-reset-secret'
  );
}

function signPayload(payloadB64: string): string {
  return createHmac('sha256', getSigningSecret()).update(payloadB64).digest('base64url');
}

function verifySignature(payloadB64: string, signature: string): boolean {
  try {
    const expected = signPayload(payloadB64);
    const a = Buffer.from(signature, 'base64url');
    const b = Buffer.from(expected, 'base64url');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Issue a one-time password setup/reset token stored in Supabase. */
export async function issuePasswordSetupToken(db: SupabaseClient, email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SETUP_TTL_MS).toISOString();

  await db.from('password_setup_tokens').delete().ilike('email', normalized);

  const { error } = await db.from('password_setup_tokens').insert({
    token_hash: tokenHash,
    email: normalized,
    expires_at: expiresAt,
  });

  if (error) {
    throw new Error(
      error.message.includes('password_setup_tokens') ||
        error.code === '42P01' ||
        error.code === 'PGRST205'
        ? 'Password reset storage is not set up. Run migration 20250812110000_password_setup_tokens.sql in Supabase.'
        : error.message,
    );
  }

  return token;
}

/**
 * Consume a one-time password token.
 * Supports new DB tokens and marks legacy signed tokens as used (single-use).
 */
export async function consumePasswordSetupToken(
  db: SupabaseClient,
  token: string,
): Promise<string | null> {
  const trimmed = token.trim();
  if (!trimmed) return null;

  const tokenHash = hashToken(trimmed);

  // New durable tokens
  const { data, error } = await db
    .from('password_setup_tokens')
    .delete()
    .eq('token_hash', tokenHash)
    .gt('expires_at', new Date().toISOString())
    .select('email')
    .maybeSingle();

  if (!error && data?.email) {
    return data.email.trim().toLowerCase();
  }

  // Legacy signed tokens — verify, then burn so they cannot be reused
  const dot = trimmed.indexOf('.');
  if (dot === -1) return null;

  const payloadB64 = trimmed.slice(0, dot);
  const signature = trimmed.slice(dot + 1);
  if (!payloadB64 || !signature || !verifySignature(payloadB64, signature)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as {
      email?: string;
      exp?: number;
    };
    if (!payload.email || typeof payload.exp !== 'number') return null;
    if (Date.now() > payload.exp) return null;

    const email = payload.email.trim().toLowerCase();

    // If this hash was already consumed, reject
    const { data: already } = await db
      .from('password_setup_tokens')
      .select('token_hash')
      .eq('token_hash', tokenHash)
      .maybeSingle();
    if (already) return null;

    // Burn legacy token (store as already-expired row so reuse fails)
    await db.from('password_setup_tokens').insert({
      token_hash: tokenHash,
      email,
      expires_at: new Date(0).toISOString(),
    });

    return email;
  } catch {
    return null;
  }
}
