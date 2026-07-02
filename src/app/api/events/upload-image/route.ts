import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { resolveStaffActor } from '@/lib/auth/staff-access-server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const BUCKET = 'event-images';
const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const actor = await resolveStaffActor(request);
  if (!actor) {
    return NextResponse.json({ error: 'Staff access required' }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const eventId = String(formData.get('eventId') ?? '').trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: 'Only JPEG, PNG, and WebP images are allowed' },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Image must be 5 MB or smaller' }, { status: 400 });
  }

  const folder = eventId || randomUUID();
  const path = `posters/${folder}/poster.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await db.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = db.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, path });
}
