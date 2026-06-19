import { normalizePhone } from '@/lib/auth/session';

interface OtpEntry {
  code: string;
  expiresAt: number;
}

const globalForOtp = globalThis as typeof globalThis & { __ckcOtpStore?: Map<string, OtpEntry> };

function getStore(): Map<string, OtpEntry> {
  if (!globalForOtp.__ckcOtpStore) {
    globalForOtp.__ckcOtpStore = new Map();
  }
  return globalForOtp.__ckcOtpStore;
}

const OTP_TTL_MS = 10 * 60 * 1000;

export function issueOtp(phone: string): string {
  const normalized = normalizePhone(phone);
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  getStore().set(normalized, { code, expiresAt: Date.now() + OTP_TTL_MS });
  return code;
}

export function checkOtp(phone: string, code: string): boolean {
  const normalized = normalizePhone(phone);
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
