import { normalizeEmail } from '@/lib/auth/super-admin';
import type { SupabaseClient } from '@supabase/supabase-js';

type ProfileRow = {
  email: string | null;
  phone: string;
  role: string;
  campus_id: string | null;
  official_name: string | null;
  username: string | null;
  display_name: string | null;
  gender: string | null;
  date_of_birth: string | null;
  password_hash: string | null;
};

type MemberRow = {
  id: string;
  profile_id: string | null;
  phone: string;
  email: string | null;
  campus_id: string;
  full_name: string;
  surname: string;
  username: string | null;
  gender: string | null;
  date_of_birth: string | null;
  application_id: string | null;
  status: string;
};

const PROFILE_COLUMNS =
  'id, email, phone, role, campus_id, official_name, username, display_name, gender, date_of_birth, password_hash';

function normalizeProfilePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/** SA numbers are sometimes stored as 082… or 2782… — try both when matching profiles. */
function phoneLookupVariants(phone: string): string[] {
  const digits = normalizeProfilePhone(phone);
  const variants = new Set<string>([phone.trim(), digits]);
  if (digits.startsWith('0') && digits.length === 10) {
    variants.add(`27${digits.slice(1)}`);
  }
  if (digits.startsWith('27') && digits.length === 11) {
    variants.add(`0${digits.slice(2)}`);
  }
  return [...variants].filter(Boolean);
}

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === '23505';
}

function isUsernameConflict(error: { message?: string; details?: string } | null): boolean {
  const text = `${error?.message ?? ''} ${error?.details ?? ''}`.toLowerCase();
  return text.includes('username');
}

function isEmailConflict(error: { message?: string; details?: string } | null): boolean {
  const text = `${error?.message ?? ''} ${error?.details ?? ''}`.toLowerCase();
  return text.includes('email');
}

function isPhoneConflict(error: { message?: string; details?: string } | null): boolean {
  const text = `${error?.message ?? ''} ${error?.details ?? ''}`.toLowerCase();
  return text.includes('phone');
}

async function findProfileByEmail(
  db: SupabaseClient,
  email: string,
): Promise<(ProfileRow & { id: string }) | null> {
  const { data } = await db
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .ilike('email', email)
    .maybeSingle();
  return (data as (ProfileRow & { id: string }) | null) ?? null;
}

async function findProfileByPhone(
  db: SupabaseClient,
  phone: string,
): Promise<(ProfileRow & { id: string }) | null> {
  const variants = phoneLookupVariants(phone);
  const { data } = await db
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .in('phone', variants)
    .limit(1)
    .maybeSingle();
  return (data as (ProfileRow & { id: string }) | null) ?? null;
}

async function findActiveMemberByEmail(
  db: SupabaseClient,
  email: string,
): Promise<MemberRow | null> {
  const { data, error } = await db
    .from('members')
    .select(
      'id, profile_id, phone, email, campus_id, full_name, surname, username, gender, date_of_birth, application_id, status',
    )
    .ilike('email', email)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('[profile-sync] member lookup failed:', error.message);
  }
  if (data?.[0]) return data[0] as MemberRow;

  const { data: apps } = await db
    .from('membership_applications')
    .select('id')
    .eq('status', 'approved')
    .filter('application_data->personal->>email', 'ilike', email)
    .order('reviewed_at', { ascending: false })
    .limit(1);

  const appId = apps?.[0]?.id;
  if (!appId) return null;

  const { data: byApp } = await db
    .from('members')
    .select(
      'id, profile_id, phone, email, campus_id, full_name, surname, username, gender, date_of_birth, application_id, status',
    )
    .eq('application_id', appId)
    .eq('status', 'active')
    .maybeSingle();

  return (byApp as MemberRow | null) ?? null;
}

async function getPasswordHashFromApplication(
  db: SupabaseClient,
  applicationId: string | null,
): Promise<string | null> {
  if (!applicationId) return null;
  const { data: app } = await db
    .from('membership_applications')
    .select('password_hash')
    .eq('id', applicationId)
    .maybeSingle();
  return app?.password_hash ?? null;
}

function buildMemberProfilePayload(
  member: MemberRow,
  memberEmail: string,
  passwordHash: string | null,
  existingPasswordHash?: string | null,
): Omit<ProfileRow, 'id'> & { phone: string } {
  const phone = normalizeProfilePhone(member.phone);
  return {
    phone,
    role: 'member',
    campus_id: member.campus_id,
    official_name: member.full_name ?? null,
    username: member.username ?? null,
    display_name: member.username ?? member.full_name ?? null,
    email: memberEmail,
    gender: member.gender,
    date_of_birth: member.date_of_birth,
    password_hash: passwordHash ?? existingPasswordHash ?? null,
  };
}

async function linkMemberToProfile(
  db: SupabaseClient,
  memberId: string,
  profileId: string,
): Promise<void> {
  await db.from('members').update({ profile_id: profileId }).eq('id', memberId);
}

async function clearEmailFromOtherProfiles(
  db: SupabaseClient,
  email: string,
  keepProfileId: string,
): Promise<void> {
  await db
    .from('profiles')
    .update({ email: null })
    .ilike('email', email)
    .neq('id', keepProfileId);
}

async function persistProfileForMember(
  db: SupabaseClient,
  member: MemberRow,
  memberEmail: string,
  passwordHash: string | null,
): Promise<ProfileRow | null> {
  const phone = normalizeProfilePhone(member.phone);
  if (!phone) return null;

  let target =
    (member.profile_id
      ? await db
          .from('profiles')
          .select(PROFILE_COLUMNS)
          .eq('id', member.profile_id)
          .maybeSingle()
          .then((r) => (r.data as (ProfileRow & { id: string }) | null) ?? null)
      : null) ??
    (await findProfileByEmail(db, memberEmail)) ??
    (await findProfileByPhone(db, phone));

  let payload = buildMemberProfilePayload(
    member,
    memberEmail,
    passwordHash,
    target?.password_hash,
  );

  for (let attempt = 0; attempt < 4; attempt += 1) {
    if (target) {
      const { data, error } = await db
        .from('profiles')
        .update(payload)
        .eq('id', target.id)
        .select(PROFILE_COLUMNS)
        .single();

      if (!error && data) {
        await linkMemberToProfile(db, member.id, target.id);
        return data as ProfileRow;
      }

      if (isUniqueViolation(error)) {
        if (isUsernameConflict(error)) {
          payload = { ...payload, username: null };
          continue;
        }
        if (isEmailConflict(error) && payload.email) {
          await clearEmailFromOtherProfiles(db, payload.email, target.id);
          continue;
        }
      }

      console.error('[profile-sync] profile update failed:', error?.message);
      return null;
    }

    const { data, error } = await db
      .from('profiles')
      .insert(payload)
      .select(PROFILE_COLUMNS)
      .single();

    if (!error && data) {
      await linkMemberToProfile(db, member.id, (data as ProfileRow & { id: string }).id);
      return data as ProfileRow;
    }

    if (isUniqueViolation(error)) {
      if (isUsernameConflict(error)) {
        payload = { ...payload, username: null };
        continue;
      }
      if (isPhoneConflict(error)) {
        target = await findProfileByPhone(db, phone);
        continue;
      }
      if (isEmailConflict(error) && payload.email) {
        target = await findProfileByEmail(db, payload.email);
        continue;
      }
    }

    console.error('[profile-sync] profile insert failed:', error?.message);
    return null;
  }

  return null;
}

/**
 * Login uses profiles.email, but members list uses members.email.
 * This links an approved member row to a sign-in profile (creates or repairs it).
 */
export async function ensureProfileForEmail(
  db: SupabaseClient,
  email: string,
): Promise<ProfileRow | null> {
  const normalized = normalizeEmail(email);
  if (!normalized.includes('@')) return null;

  const existing = await findProfileByEmail(db, normalized);
  if (existing?.email) {
    const member = await findActiveMemberByEmail(db, normalized);
    if (member) {
      const passwordHash = await getPasswordHashFromApplication(db, member.application_id);
      return persistProfileForMember(db, member, normalized, passwordHash);
    }
    return existing;
  }

  const member = await findActiveMemberByEmail(db, normalized);
  if (!member?.phone) return null;

  const passwordHash = await getPasswordHashFromApplication(db, member.application_id);
  const memberEmail = normalizeEmail(member.email ?? normalized);

  return persistProfileForMember(db, member, memberEmail, passwordHash);
}

/** Repair all members that have email but no matching profile (admin maintenance). */
export async function syncAllMemberProfiles(db: SupabaseClient): Promise<{
  synced: number;
  failed: string[];
}> {
  const { data: members } = await db
    .from('members')
    .select('email')
    .not('email', 'is', null)
    .eq('status', 'active');

  let synced = 0;
  const failed: string[] = [];

  for (const row of members ?? []) {
    const email = row.email?.trim();
    if (!email?.includes('@')) continue;
    const profile = await ensureProfileForEmail(db, email);
    if (profile?.email) synced += 1;
    else failed.push(email);
  }

  return { synced, failed };
}
