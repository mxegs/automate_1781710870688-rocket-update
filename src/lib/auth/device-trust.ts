import { apiFetch, useBackend } from '@/lib/api/client';
import { normalizeEmail } from '@/lib/auth/super-admin';
import { normalizePhone } from '@/lib/auth/session';

const STORAGE_KEY = 'ckc_trusted_device';

export interface StoredDeviceTrust {
  phone?: string;
  email?: string;
  token: string;
  expiresAt: string;
}

export function getStoredDeviceTrust(): StoredDeviceTrust | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDeviceTrust;
    if (!parsed.token || !parsed.expiresAt) return null;
    if (Date.now() > new Date(parsed.expiresAt).getTime()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveDeviceTrust(trust: StoredDeviceTrust): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trust));
}

export function clearDeviceTrust(): void {
  if (typeof window === 'undefined') return;
  const stored = getStoredDeviceTrust();
  localStorage.removeItem(STORAGE_KEY);
  if (stored?.token && useBackend()) {
    void apiFetch('/api/auth/device/revoke', {
      method: 'POST',
      body: JSON.stringify({ token: stored.token }),
    }).catch(() => undefined);
  }
}

export async function tryTrustedDeviceLogin(): Promise<{ phone?: string; email?: string } | null> {
  const stored = getStoredDeviceTrust();
  if (!stored || !useBackend()) return null;

  try {
    await apiFetch('/api/auth/device/verify', {
      method: 'POST',
      body: JSON.stringify({
        phone: stored.phone,
        email: stored.email,
        token: stored.token,
      }),
    });
    return { phone: stored.phone, email: stored.email };
  } catch {
    clearDeviceTrust();
    return null;
  }
}

export async function registerDeviceTrustAfterOtp(input: {
  phone?: string;
  email?: string;
}): Promise<void> {
  if (!useBackend()) return;

  const phone = input.phone ? normalizePhone(input.phone) : undefined;
  const email = input.email ? normalizeEmail(input.email) : undefined;

  const res = await apiFetch<{ token: string; expiresAt: string }>('/api/auth/device/register', {
    method: 'POST',
    body: JSON.stringify({ phone, email }),
  });

  saveDeviceTrust({
    phone,
    email,
    token: res.token,
    expiresAt: res.expiresAt,
  });
}
