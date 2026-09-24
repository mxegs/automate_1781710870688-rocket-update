/**
 * Insert Grace Test Church plus one member, one Sunday event, and one sermon.
 * Does not send email or SMS.
 *
 * Run only against the staging database:
 *   node --env-file=.env scripts/seed-test-church.cjs
 *
 * Refuses the live CKC project.
 */
const { createClient } = require('@supabase/supabase-js');
const { randomBytes, scrypt } = require('crypto');
const { promisify } = require('util');

const scryptAsync = promisify(scrypt);
const LIVE_HOST = 'lmtxevkbrrpnvuzhbetl.supabase.co';
const CHURCH_ID = 'grace-test';
const EMAIL = 'member@grace-test.example';
const PHONE = '0820000888';
const PASSWORD = 'GraceTest2026';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derived = await scryptAsync(password, salt, 64);
  return `${salt}:${derived.toString('hex')}`;
}

function nextSundayStart() {
  const date = new Date();
  const day = date.getDay();
  const daysUntil = day === 0 ? 7 : 7 - day;
  date.setDate(date.getDate() + daysUntil);
  date.setHours(9, 0, 0, 0);
  return date.toISOString();
}

async function main() {
  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  if (url.includes(LIVE_HOST)) {
    throw new Error('Refusing to seed the live CKC database. Point .env at the staging project first.');
  }

  const db = createClient(url, key, { auth: { persistSession: false } });
  const passwordHash = await hashPassword(PASSWORD);
  const startsAt = nextSundayStart();
  const endsAt = new Date(new Date(startsAt).getTime() + 2 * 60 * 60 * 1000).toISOString();

  const { error: churchError } = await db.from('churches').upsert(
    {
      id: CHURCH_ID,
      name: 'Grace Test Church',
      slug: 'grace-test',
      primary_color: '#2E5C8A',
      secondary_color: '#0A0A0A',
      is_active: true,
    },
    { onConflict: 'id' },
  );
  if (churchError) throw new Error(churchError.message);

  const { data: existingProfile, error: findError } = await db
    .from('profiles')
    .select('id')
    .eq('email', EMAIL)
    .maybeSingle();
  if (findError) throw new Error(findError.message);

  let profileId = existingProfile?.id;
  if (!profileId) {
    profileId = crypto.randomUUID();
    const { error: profileError } = await db.from('profiles').insert({
      id: profileId,
      phone: PHONE,
      role: 'member',
      campus_id: 'midrand',
      church_id: CHURCH_ID,
      official_name: 'Grace Member',
      username: 'grace_test_member',
      display_name: 'Grace',
      email: EMAIL,
      password_hash: passwordHash,
    });
    if (profileError) throw new Error(profileError.message);
  }

  const { data: existingMember, error: memberFindError } = await db
    .from('members')
    .select('id')
    .eq('profile_id', profileId)
    .maybeSingle();
  if (memberFindError) throw new Error(memberFindError.message);

  if (!existingMember) {
    const { error: memberError } = await db.from('members').insert({
      profile_id: profileId,
      campus_id: 'midrand',
      church_id: CHURCH_ID,
      status: 'active',
      surname: 'Member',
      full_name: 'Grace Member',
      username: 'grace_test_member',
      phone: PHONE,
      email: EMAIL,
    });
    if (memberError) throw new Error(memberError.message);
  }

  const { error: eventError } = await db.from('events').insert({
    title: 'Grace Test Sunday',
    description: 'Test service for the second church.',
    campus_id: 'midrand',
    church_id: CHURCH_ID,
    visibility: 'church_wide',
    category: 'Sunday Service',
    location: 'Grace Test Church',
    starts_at: startsAt,
    ends_at: endsAt,
  });
  if (eventError) throw new Error(eventError.message);

  const { error: sermonError } = await db.from('media_items').insert({
    campus_id: 'midrand',
    church_id: CHURCH_ID,
    visibility: 'church_wide',
    media_type: 'sermon',
    title: 'Grace Test Sermon',
    preacher: 'Grace Pastor',
    preached_at: new Date().toISOString().slice(0, 10),
    category: 'Sunday Service',
    description: 'Test sermon for the second church.',
    external_url: 'https://example.com/grace-test-sermon',
  });
  if (sermonError) throw new Error(sermonError.message);

  console.log('Grace Test Church is on staging.');
  console.log(`Sign in as ${EMAIL}`);
  console.log(`Password: ${PASSWORD}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
