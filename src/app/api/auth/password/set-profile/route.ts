import { NextResponse } from 'next/server';
import {
  consumePasswordSetupToken,
  hashPassword,
  validatePasswordStrength,
} from '@/lib/auth/password-server';
import { ensureProfileForEmail } from '@/lib/auth/profile-sync';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

/** Set password on an existing profile (staff/admin) using a one-time setup token. */
export async function POST(request: Request) {
  try {
    const db = getSupabaseAdmin();
    if (!db) {
      return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
    }

    const body = await request.json();
    const setupToken = String(body.setupToken ?? '').trim();
    const password = String(body.password ?? '');

    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    if (!setupToken) {
      return NextResponse.json({ error: 'Setup token is required' }, { status: 400 });
    }

    const email = await consumePasswordSetupToken(db, setupToken);
    if (!email) {
      return NextResponse.json(
        { error: 'This reset link has expired or was already used. Request a new one from the forgot password page.' },
        { status: 401 },
      );
    }

    const { data: profileRow, error: lookupError } = await db
      .from('profiles')
      .select('id, email')
      .ilike('email', email)
      .maybeSingle();

    if (lookupError) {
      console.error('[set-profile] profile lookup failed:', lookupError.message);
      return NextResponse.json({ error: 'Could not look up your account' }, { status: 500 });
    }

    let profile = profileRow;

    if (!profile?.email) {
      const synced = await ensureProfileForEmail(db, email);
      if (synced?.email) {
        const { data: row, error: refetchError } = await db
          .from('profiles')
          .select('id, email')
          .ilike('email', email)
          .maybeSingle();

        if (refetchError) {
          console.error('[set-profile] profile refetch failed:', refetchError.message);
          return NextResponse.json({ error: 'Could not look up your account' }, { status: 500 });
        }
        profile = row;
      }
    }

    if (!profile?.id || !profile.email) {
      return NextResponse.json(
        { error: 'No account found for this reset link. Contact your church admin.' },
        { status: 404 },
      );
    }

    const passwordHash = await hashPassword(password);

    const { error: updateError } = await db
      .from('profiles')
      .update({ password_hash: passwordHash })
      .eq('id', profile.id);

    if (updateError) {
      console.error('[set-profile] password update failed:', updateError.message);
      return NextResponse.json({ error: 'Could not save your new password. Try again.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, email: profile.email });
  } catch (err) {
    console.error('[set-profile] unexpected error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
