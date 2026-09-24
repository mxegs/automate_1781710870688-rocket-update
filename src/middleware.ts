import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { extractChurchSlug } from '@/lib/church/resolve-from-url';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const slug = extractChurchSlug(pathname);
  if (!slug) return NextResponse.next();

  const rest = pathname.slice(slug.length + 1) || '/login';
  const url = request.nextUrl.clone();
  url.pathname = rest.startsWith('/') ? rest : `/${rest}`;
  const response = NextResponse.rewrite(url);
  response.headers.set('x-church-slug', slug);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|api|assets|favicon.ico|manifest.webmanifest|sw.js).*)'],
};
