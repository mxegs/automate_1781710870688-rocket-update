import { buildOtpSmsMessage, sendSms } from '@/lib/sms/service';

const OTP_STORE_KEY = 'ckc_otp_store';

interface OtpEntry {
  phone: string;
  code: string;
  expiresAt: number;
}

function getStore(): Record<string, OtpEntry> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(OTP_STORE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveStore(store: Record<string, OtpEntry>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(OTP_STORE_KEY, JSON.stringify(store));
}

/** Demo OTP — delegates to SMS service (demo logs to console until provider is wired) */
export function sendOtp(phone: string): string {
  const normalized = phone.replace(/\D/g, '');
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const store = getStore();
  store[normalized] = {
    phone: normalized,
    code,
    expiresAt: Date.now() + 10 * 60 * 1000,
  };
  saveStore(store);
  void sendSms(normalized, buildOtpSmsMessage(code));
  return code;
}

export function verifyOtp(phone: string, code: string): boolean {
  const normalized = phone.replace(/\D/g, '');
  const store = getStore();
  const entry = store[normalized];

  // Demo fallback: accept any 6 digits when no OTP was sent
  if (!entry && /^\d{6}$/.test(code)) return true;

  if (!entry) return false;
  if (Date.now() > entry.expiresAt) return false;
  return entry.code === code;
}

export function getStoredOtpForDemo(phone: string): string | null {
  const normalized = phone.replace(/\D/g, '');
  return getStore()[normalized]?.code ?? null;
}
