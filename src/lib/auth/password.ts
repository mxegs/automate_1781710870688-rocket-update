import { apiFetch } from '@/lib/api/client';

export async function setMemberPassword(input: {
  applicationId: string;
  password: string;
}): Promise<{ ok: boolean }> {
  return apiFetch('/api/auth/password/set', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function loginWithPassword(
  email: string,
  password: string,
): Promise<{
  email: string;
  phone: string;
  role: string;
  campusId?: string;
  officialName?: string;
  username?: string;
  displayName?: string;
  isSuperAdmin?: boolean;
  dbRole?: string;
}> {
  return apiFetch('/api/auth/password/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function checkEmailLoginOptions(email: string): Promise<{
  registered: boolean;
  hasPassword?: boolean;
  role?: string;
  source?: string;
}> {
  return apiFetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
}

export async function setProfilePassword(input: {
  setupToken: string;
  password: string;
}): Promise<{ ok: boolean; email: string }> {
  return apiFetch('/api/auth/password/set-profile', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function changePassword(input: {
  email: string;
  currentPassword: string;
  newPassword: string;
}): Promise<{ ok: boolean }> {
  return apiFetch('/api/auth/password/change', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
