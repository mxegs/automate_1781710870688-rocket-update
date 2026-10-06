import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { sessionProfileDenied, sessionProfileFromRequest } from '@/lib/notifications/server';
import {
  MEMBER_PHOTO_BUCKET,
  MEMBER_PHOTO_MAX_BYTES,
  MEMBER_PHOTO_MIME,
  memberPhotoObjectPaths,
  memberPhotoPath,
} from '@/lib/members/photo';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

type MemberRow = {
  id: string;
  profile_id: string | null;
  church_id: string;
  photo_url: string | null;
};

async function sessionMember(
  request: Request,
): Promise<
  | { db: SupabaseClient; churchId: string; profileId: string; member: MemberRow }
  | { denied: true }
  | { response: NextResponse }
> {
  const session = await sessionProfileFromRequest(request);
  if (!session) return { denied: true };

  const db = getSupabaseAdmin();
  if (!db) return { response: NextResponse.json({ error: 'Backend not configured' }, { status: 503 }) };

  const { data, error } = await db
    .from('members')
    .select('id, profile_id, church_id, photo_url')
    .eq('profile_id', session.id)
    .eq('church_id', session.churchId)
    .maybeSingle();

  if (error) return { response: NextResponse.json({ error: error.message }, { status: 500 }) };
  if (!data) return { denied: true };

  const member = data as MemberRow;
  if (member.church_id !== session.churchId || member.profile_id !== session.id) return { denied: true };

  return { db, churchId: session.churchId, profileId: session.id, member };
}

async function removeStoredPhotos(db: SupabaseClient, churchId: string, memberId: string) {
  await db.storage.from(MEMBER_PHOTO_BUCKET).remove(memberPhotoObjectPaths(churchId, memberId));
}

function formText(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request: Request) {
  const resolved = await sessionMember(request);
  if ('denied' in resolved) return sessionProfileDenied();
  if ('response' in resolved) return resolved.response;

  const { db, churchId, profileId, member } = resolved;

  const formData = await request.formData();
  const spoofChurch = formText(formData, 'churchId') || formText(formData, 'church_id');
  const spoofMember = formText(formData, 'memberId') || formText(formData, 'member_id');
  const spoofPath = formText(formData, 'path');
  if (spoofChurch && spoofChurch !== churchId) return sessionProfileDenied();
  if (spoofMember && spoofMember !== member.id) return sessionProfileDenied();
  if (spoofPath) {
    const allowed = memberPhotoObjectPaths(churchId, member.id);
    if (!allowed.includes(spoofPath)) return sessionProfileDenied();
  }

  const file = formData.get('photo');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Photo file is required' }, { status: 400 });
  }

  const ext = MEMBER_PHOTO_MIME[file.type];
  if (!ext) {
    return NextResponse.json({ error: 'Only JPEG, PNG, and WebP images are allowed' }, { status: 400 });
  }

  if (file.size > MEMBER_PHOTO_MAX_BYTES) {
    return NextResponse.json({ error: 'Image must be 2 MB or smaller' }, { status: 413 });
  }

  const path = memberPhotoPath(churchId, member.id, ext);
  await removeStoredPhotos(db, churchId, member.id);

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await db.storage.from(MEMBER_PHOTO_BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: true,
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data } = db.storage.from(MEMBER_PHOTO_BUCKET).getPublicUrl(path);
  const photoUrl = `${data.publicUrl}?v=${Date.now()}`;

  const { error: memberError } = await db
    .from('members')
    .update({ photo_url: photoUrl })
    .eq('id', member.id)
    .eq('church_id', churchId)
    .eq('profile_id', profileId);

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  await db.from('profiles').update({ photo_url: photoUrl }).eq('id', profileId).eq('church_id', churchId);

  return NextResponse.json({ photoUrl });
}

export async function DELETE(request: Request) {
  const resolved = await sessionMember(request);
  if ('denied' in resolved) return sessionProfileDenied();
  if ('response' in resolved) return resolved.response;

  const { db, churchId, profileId, member } = resolved;

  await removeStoredPhotos(db, churchId, member.id);

  const { error: memberError } = await db
    .from('members')
    .update({ photo_url: null })
    .eq('id', member.id)
    .eq('church_id', churchId)
    .eq('profile_id', profileId);

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  await db.from('profiles').update({ photo_url: null }).eq('id', profileId).eq('church_id', churchId);

  return NextResponse.json({ photoUrl: null });
}

export async function PATCH(request: Request) {
  const resolved = await sessionMember(request);
  if ('denied' in resolved) return sessionProfileDenied();
  if ('response' in resolved) return resolved.response;

  const { db, churchId, profileId, member } = resolved;

  const body = (await request.json().catch(() => null)) as { photoVisible?: unknown } | null;
  if (typeof body?.photoVisible !== 'boolean') {
    return NextResponse.json({ error: 'photoVisible boolean is required' }, { status: 400 });
  }

  const { error } = await db
    .from('members')
    .update({ photo_visible: body.photoVisible })
    .eq('id', member.id)
    .eq('church_id', churchId)
    .eq('profile_id', profileId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ photoVisible: body.photoVisible });
}
