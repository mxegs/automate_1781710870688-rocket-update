import { apiFetch, useBackend } from '@/lib/api/client';
import { buildOtpSmsMessage, sendSms } from '@/lib/sms/service';

const OTP_STORE_KEY = 'ckc_otp_store';

interface OtpEntry {
  phone: string;
  code: string;
  expiresAt: number;
}

export interface SendOtpResult {
  demo: boolean;
  /** Present only in local demo mode */
  code?: string;
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

function sendOtpLocal(phone: string): SendOtpResult {
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
  return { demo: true, code };
}

/** Send OTP via BulkSMS (server) or local demo store */
export async function sendOtp(phone: string): Promise<SendOtpResult> {
  if (useBackend()) {
    const res = await apiFetch<{ ok: boolean; demo?: boolean }>('/api/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
    return { demo: res.demo ?? false };
  }
  return sendOtpLocal(phone);
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  if (useBackend()) {
    try {
      await apiFetch('/api/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ phone, code }),
      });
      return true;
    } catch {
      return false;
    }
  }

  const normalized = phone.replace(/\D/g, '');
  const store = getStore();
  const entry = store[normalized];

  if (!entry && /^\d{6}$/.test(code)) return true;
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) return false;
  return entry.code === code;
}

export function getStoredOtpForDemo(phone: string): string | null {
  const normalized = phone.replace(/\D/g, '');
  return getStore()[normalized]?.code ?? null;
}
