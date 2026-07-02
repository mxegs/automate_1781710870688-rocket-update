import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

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

interface PasswordSetupEntry {
  email: string;
  expiresAt: number;
}

const globalForPasswordSetup = globalThis as typeof globalThis & {
  __ckcPasswordSetupStore?: Map<string, PasswordSetupEntry>;
};

function getSetupStore(): Map<string, PasswordSetupEntry> {
  if (!globalForPasswordSetup.__ckcPasswordSetupStore) {
    globalForPasswordSetup.__ckcPasswordSetupStore = new Map();
  }
  return globalForPasswordSetup.__ckcPasswordSetupStore;
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

function consumeLegacyPasswordSetupToken(token: string): string | null {
  const entry = getSetupStore().get(token);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    getSetupStore().delete(token);
    return null;
  }
  getSetupStore().delete(token);
  return entry.email;
}

/** Signed, stateless token for password reset / first-time password setup. */
export function issuePasswordSetupToken(email: string): string {
  const normalized = email.trim().toLowerCase();
  const payload = JSON.stringify({
    email: normalized,
    exp: Date.now() + SETUP_TTL_MS,
  });
  const payloadB64 = Buffer.from(payload, 'utf8').toString('base64url');
  return `${payloadB64}.${signPayload(payloadB64)}`;
}

export function consumePasswordSetupToken(token: string): string | null {
  const trimmed = token.trim();
  if (!trimmed) return null;

  const dot = trimmed.indexOf('.');
  if (dot === -1) {
    return consumeLegacyPasswordSetupToken(trimmed);
  }

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
    return payload.email.trim().toLowerCase();
  } catch {
    return null;
  }
}
