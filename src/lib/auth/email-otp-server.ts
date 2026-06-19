import { normalizeEmail } from '@/lib/auth/super-admin';

interface OtpEntry {
  code: string;
  expiresAt: number;
}

const globalForEmailOtp = globalThis as typeof globalThis & {
  __ckcEmailOtpStore?: Map<string, OtpEntry>;
};

function getStore(): Map<string, OtpEntry> {
  if (!globalForEmailOtp.__ckcEmailOtpStore) {
    globalForEmailOtp.__ckcEmailOtpStore = new Map();
  }
  return globalForEmailOtp.__ckcEmailOtpStore;
}

const OTP_TTL_MS = 10 * 60 * 1000;

export function issueEmailOtp(email: string): string {
  const normalized = normalizeEmail(email);
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  getStore().set(normalized, { code, expiresAt: Date.now() + OTP_TTL_MS });
  return code;
}

export function checkEmailOtp(email: string, code: string): boolean {
  const normalized = normalizeEmail(email);
  const entry = getStore().get(normalized);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    getStore().delete(normalized);
    return false;
  }
  if (entry.code !== code) return false;
  getStore().delete(normalized);
  return true;
}
