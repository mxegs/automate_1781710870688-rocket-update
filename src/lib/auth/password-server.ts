import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const MIN_PASSWORD_LENGTH = 8;

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

const SETUP_TTL_MS = 30 * 60 * 1000;

function generateSetupToken(): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

/** One-time token so staff/admins can set a password after email link sign-in. */
export function issuePasswordSetupToken(email: string): string {
  const normalized = email.trim().toLowerCase();
  const token = generateSetupToken();
  getSetupStore().set(token, {
    email: normalized,
    expiresAt: Date.now() + SETUP_TTL_MS,
  });
  return token;
}

export function consumePasswordSetupToken(token: string): string | null {
  const entry = getSetupStore().get(token);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    getSetupStore().delete(token);
    return null;
  }
  getSetupStore().delete(token);
  return entry.email;
}
