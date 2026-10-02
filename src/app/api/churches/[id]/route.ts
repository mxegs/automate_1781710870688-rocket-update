import { NextResponse } from 'next/server';
import { churchIdForSessionEmail } from '@/lib/auth/session-church';
import { resolveChurchId } from '@/lib/church/tenant';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });

  const { id } = await params;
  const churchId = resolveChurchId(id);
  if (!churchId) return NextResponse.json({ error: 'Church not found' }, { status: 404 });
  const { data, error } = await db
    .from('churches')
    .select('id, name, slug, primary_color, secondary_color, logo_url, app_name')
    .eq('id', churchId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Church not found' }, { status: 404 });

  const payload: Record<string, unknown> = {
    id: data.id,
    name: data.name,
    slug: data.slug,
    primaryColor: data.primary_color,
    secondaryColor: data.secondary_color,
    logoUrl: data.logo_url,
    appName: data.app_name,
  };

  const sessionChurchId = await churchIdForSessionEmail(request);
  if (sessionChurchId === churchId) {
    const extra = await db.from('churches').select('stream_url').eq('id', churchId).maybeSingle();
    if (!extra.error) {
      payload.streamUrl = extra.data?.stream_url ?? null;
    }
  }

  return NextResponse.json(payload);
}
