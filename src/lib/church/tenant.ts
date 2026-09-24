export const DEFAULT_CHURCH_ID = 'ckc';

export function resolveChurchId(churchId?: string | null): string {
  const value = churchId?.trim();
  return value || DEFAULT_CHURCH_ID;
}

export function withChurchId(params: URLSearchParams, churchId?: string | null): URLSearchParams {
  params.set('churchId', resolveChurchId(churchId));
  return params;
}

export function churchIdFromUrl(url: string): string {
  return resolveChurchId(new URL(url).searchParams.get('churchId'));
}
