import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { normalizePhone } from '@/lib/auth/session';
import { normalizeEmail } from '@/lib/auth/super-admin';

const DEFAULT_TRUST_DAYS = 90;

function getTrustDays(): number {
  const raw = Number(process.env.DEVICE_TRUST_DAYS ?? DEFAULT_TRUST_DAYS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_TRUST_DAYS;
}

function getSecret(): string {
  return process.env.DEVICE_TRUST_SECRET?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY || 'ckc-dev-device-trust';
}

export function hashDeviceToken(token: string): string {
  return crypto.createHmac('sha256', getSecret()).update(token).digest('hex');
}

export function generateDeviceToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

export async function registerTrustedDevice(input: {
  phone?: string;
  email?: string;
  userAgent?: string | null;
}): Promise<{ token: string; expiresAt: string } | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;

  const phone = input.phone ? normalizePhone(input.phone) : null;
  const email = input.email ? normalizeEmail(input.email) : null;
  if (!phone && !email) return null;

  const token = generateDeviceToken();
  const tokenHash = hashDeviceToken(token);
  const expiresAt = new Date(Date.now() + getTrustDays() * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await db.from('trusted_devices').insert({
    phone,
    email,
    token_hash: tokenHash,
    user_agent: input.userAgent?.slice(0, 500) ?? null,
    expires_at: expiresAt,
  });

  if (error) {
    console.error('[trusted device register]', error.message);
    return null;
  }

  return { token, expiresAt };
}

export async function verifyTrustedDevice(input: {
  phone?: string;
  email?: string;
  token: string;
}): Promise<boolean> {
  const db = getSupabaseAdmin();
  if (!db) return false;

  const phone = input.phone ? normalizePhone(input.phone) : null;
  const email = input.email ? normalizeEmail(input.email) : null;
  const tokenHash = hashDeviceToken(input.token);

  let query = db
    .from('trusted_devices')
    .select('id, expires_at')
    .eq('token_hash', tokenHash)
    .gt('expires_at', new Date().toISOString());

  if (phone) query = query.eq('phone', phone);
  if (email) query = query.ilike('email', email);

  const { data, error } = await query.maybeSingle();
  if (error || !data) return false;

  await db
    .from('trusted_devices')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id);

  return true;
}

export async function revokeTrustedDevice(token: string): Promise<void> {
  const db = getSupabaseAdmin();
  if (!db) return;
  await db.from('trusted_devices').delete().eq('token_hash', hashDeviceToken(token));
}
