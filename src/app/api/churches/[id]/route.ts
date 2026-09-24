import { NextResponse } from 'next/server';
import { resolveChurchId } from '@/lib/church/tenant';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const { id } = await params;
  const churchId = resolveChurchId(id);
  const { data, error } = await db
    .from('churches')
    .select('id, name, slug, primary_color, secondary_color, logo_url, app_name')
    .eq('id', churchId)
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
