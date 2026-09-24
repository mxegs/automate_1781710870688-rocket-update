export function resolveChurchId(churchId?: string | null): string | null {
  const value = churchId?.trim();
  return value || null;
}

export function withChurchId(params: URLSearchParams, churchId?: string | null): URLSearchParams {
  const id = resolveChurchId(churchId);
  if (id) params.set('churchId', id);
  return params;
}

export function churchIdFromUrl(url: string): string | null {
  return resolveChurchId(new URL(url).searchParams.get('churchId'));
}
