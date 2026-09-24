import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const { slug } = await params;
  const { data, error } = await db
    .from('churches')
    .select('id, name, slug, primary_color, secondary_color, logo_url, app_name')
    .eq('slug', slug)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Church not found' }, { status: 404 });

  return NextResponse.json({
    id: data.id,
    name: data.name,
    slug: data.slug,
    primaryColor: data.primary_color,
    secondaryColor: data.secondary_color,
    logoUrl: data.logo_url,
    appName: data.app_name,
  });
}
