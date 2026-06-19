/** Public app base URL for links in SMS and emails */
export function getAppUrl(request?: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (request) {
    const origin = request.headers.get('origin');
    if (origin) return origin.replace(/\/$/, '');

    const proto = request.headers.get('x-forwarded-proto') ?? 'http';
    const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
    if (host) return `${proto}://${host}`.replace(/\/$/, '');
  }

  return 'http://localhost:4028';
}
