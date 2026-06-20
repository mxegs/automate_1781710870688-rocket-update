import { supabaseConfigured } from '@/lib/supabase/client';
import { getSession } from '@/lib/auth/session';

export function useBackend(): boolean {
  return supabaseConfigured;
}

export function staffHeaders(): Record<string, string> {
  const session = getSession();
  if (session?.email) {
    return { 'X-Staff-Email': session.email };
  }
  return {};
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}
