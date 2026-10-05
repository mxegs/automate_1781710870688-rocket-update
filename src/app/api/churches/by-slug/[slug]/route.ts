import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const PUBLIC_COLUMNS =
  'id, name, slug, primary_color, secondary_color, logo_url, app_name, tagline, welcome_message, hero_url';
const LEGACY_COLUMNS = 'id, name, slug, primary_color, secondary_color, logo_url, app_name';

function mapChurch(data: {
  id: string;
  name: string;
  slug: string;
  primary_color: string | null;
  secondary_color: string | null;
  logo_url: string | null;
  app_name: string | null;
  tagline?: string | null;
  welcome_message?: string | null;
  hero_url?: string | null;
}) {
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    primaryColor: data.primary_color,
    secondaryColor: data.secondary_color,
    logoUrl: data.logo_url,
    appName: data.app_name,
    tagline: data.tagline ?? null,
    welcomeMessage: data.welcome_message ?? null,
    heroUrl: data.hero_url ?? null,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const { slug } = await params;
  let { data, error } = await db.from('churches').select(PUBLIC_COLUMNS).eq('slug', slug).maybeSingle();
  if (error && /tagline|welcome_message|hero_url/.test(error.message)) {
    const fallback = await db.from('churches').select(LEGACY_COLUMNS).eq('slug', slug).maybeSingle();
    data = fallback.data
      ? { ...fallback.data, tagline: null, welcome_message: null, hero_url: null }
      : fallback.data;
    error = fallback.error;
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Church not found' }, { status: 404 });

  return NextResponse.json(mapChurch(data));
}
