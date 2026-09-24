/**
 * Insert Grace Test Church plus one member, one Sunday event, and one sermon.
 * Also inserts one filled-in CKC member, one CKC Sunday event, and one CKC sermon.
 * Does not send email or SMS. Re-running skips rows that already exist.
 *
 * Run only against the staging database:
 *   node --env-file=.env.staging scripts/seed-test-church.cjs
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

const CKC_CHURCH_ID = 'ckc';
const CKC_EMAIL = 'thabo.mokoena@ckc-test.example';
const CKC_PHONE = '0825550142';
const CKC_PASSWORD = 'CkcTest2026';
const CKC_EVENT_TITLE = 'CKC Sunday Service';
const CKC_SERMON_TITLE = 'Walking by Faith';

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

async function rowExists(db, table, column, value) {
  const { data, error } = await db.from(table).select('id').eq(column, value).limit(1);
  if (error) throw new Error(error.message);
  return Boolean(data?.length);
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
      name: 'Grace Church',
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

  if (!(await rowExists(db, 'events', 'title', 'Grace Test Sunday'))) {
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
  }

  if (!(await rowExists(db, 'media_items', 'title', 'Grace Test Sermon'))) {
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
  }

  await seedCkcMember(db, startsAt, endsAt);

  console.log('Grace Test Church is on staging.');
  console.log(`Sign in as ${EMAIL}`);
  console.log(`Password: ${PASSWORD}`);
  console.log('CKC test member is on staging.');
  console.log(`Sign in as ${CKC_EMAIL}`);
  console.log(`Password: ${CKC_PASSWORD}`);
}

function ckcApplication(today) {
  return {
    submittedAt: new Date().toISOString(),
    personal: {
      todayDate: today,
      surname: 'Mokoena',
      fullName: 'Thabo Mokoena',
      username: 'thabo_mokoena',
      campus: 'midrand',
      identityType: 'sa_id',
      identityNumber: '9003155800084',
      dateOfBirth: '1990-03-15',
      age: 36,
      permanentAddress: '14 Swallow Street, Halfway House, Midrand, 1685',
      email: CKC_EMAIL,
      cellNo: CKC_PHONE,
      telNo: '0115550142',
      gender: 'Male',
      citizenship: 'RSA',
      countryOfOrigin: 'South Africa',
      maritalStatus: 'Married',
      occupation: ['Private Sector'],
      occupationOther: '',
      employer: 'Midrand Logistics',
      contactName: 'Lerato Mokoena',
      contactTel: '0825550198',
      idPhotoDataUrl: '',
    },
    guardian: {
      title: '',
      fullName: '',
      surname: '',
      identityNumber: '',
      familyGroupId: '',
      relationship: '',
      telHome: '',
      telWork: '',
      streetAddress: '',
      occupation: '',
      organisation: '',
      spouseJoining: 'Yes',
      numberOfDependants: 1,
      dependants: [{ name: 'Amahle', surname: 'Mokoena', age: 6 }],
    },
    emergencyContact: {
      name: 'Lerato Mokoena',
      relationship: 'Spouse',
      phoneNumber: '0825550198',
    },
    spiritual: {
      acceptedChrist: 'Yes',
      baptized: 'Yes',
      baptismDate: '2014-04-20',
      baptismLocation: 'CKC Midrand',
      previousChurchMember: 'Yes',
      previousChurchName: 'Hope Fellowship',
      previousChurchDate: '2018-01-14',
      previousChurchLocation: 'Johannesburg',
      reasonForLeaving: 'Moved closer to Midrand',
    },
    ministry: {
      areasOfInterest: ['Hospitality', 'Prayer Team'],
      spiritualGifts: 'Encouragement',
      ministryPassions: 'Welcoming new families on Sunday',
    },
    covenant: {
      agreedToCovenant: true,
      fullName: 'Thabo Mokoena',
      dateSigned: today,
      signatureDataUrl: '',
    },
  };
}

async function seedCkcMember(db, startsAt, endsAt) {
  const today = new Date().toISOString().slice(0, 10);
  const passwordHash = await hashPassword(CKC_PASSWORD);

  const { data: existingProfile, error: findError } = await db
    .from('profiles')
    .select('id')
    .eq('email', CKC_EMAIL)
    .maybeSingle();
  if (findError) throw new Error(findError.message);

  let profileId = existingProfile?.id;
  if (!profileId) {
    profileId = crypto.randomUUID();
    const { error: profileError } = await db.from('profiles').insert({
      id: profileId,
      phone: CKC_PHONE,
      role: 'member',
      campus_id: 'midrand',
      church_id: CKC_CHURCH_ID,
      official_name: 'Thabo Mokoena',
      username: 'thabo_mokoena',
      display_name: 'Thabo',
      email: CKC_EMAIL,
      gender: 'Male',
      date_of_birth: '1990-03-15',
      password_hash: passwordHash,
    });
    if (profileError) throw new Error(profileError.message);
  } else {
    const { error: passwordError } = await db
      .from('profiles')
      .update({ password_hash: passwordHash, church_id: CKC_CHURCH_ID })
      .eq('id', profileId);
    if (passwordError) throw new Error(passwordError.message);
  }

  const { data: existingApp, error: appFindError } = await db
    .from('membership_applications')
    .select('id')
    .eq('phone', CKC_PHONE)
    .eq('church_id', CKC_CHURCH_ID)
    .maybeSingle();
  if (appFindError) throw new Error(appFindError.message);

  let applicationId = existingApp?.id;
  if (!applicationId) {
    const { data: application, error: appError } = await db
      .from('membership_applications')
      .insert({
        phone: CKC_PHONE,
        campus_id: 'midrand',
        church_id: CKC_CHURCH_ID,
        status: 'approved',
        application_data: ckcApplication(today),
        submitted_at: new Date().toISOString(),
        reviewed_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    if (appError) throw new Error(appError.message);
    applicationId = application.id;
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
      application_id: applicationId,
      campus_id: 'midrand',
      church_id: CKC_CHURCH_ID,
      status: 'active',
      surname: 'Mokoena',
      full_name: 'Thabo Mokoena',
      username: 'thabo_mokoena',
      phone: CKC_PHONE,
      email: CKC_EMAIL,
      gender: 'Male',
      date_of_birth: '1990-03-15',
      age: 36,
      marital_status: 'Married',
      member_since: '2024-02-11',
      covenant_signed_at: new Date().toISOString(),
    });
    if (memberError) throw new Error(memberError.message);
  }

  if (!(await rowExists(db, 'events', 'title', CKC_EVENT_TITLE))) {
    const { error: eventError } = await db.from('events').insert({
      title: CKC_EVENT_TITLE,
      description: 'Sunday gathering at CKC Midrand.',
      campus_id: 'midrand',
      church_id: CKC_CHURCH_ID,
      visibility: 'church_wide',
      category: 'Sunday Service',
      location: 'CKC Midrand, Halfway House',
      starts_at: startsAt,
      ends_at: endsAt,
    });
    if (eventError) throw new Error(eventError.message);
  }

  if (!(await rowExists(db, 'media_items', 'title', CKC_SERMON_TITLE))) {
    const { error: sermonError } = await db.from('media_items').insert({
      campus_id: 'midrand',
      church_id: CKC_CHURCH_ID,
      visibility: 'church_wide',
      media_type: 'sermon',
      title: CKC_SERMON_TITLE,
      preacher: 'Pastor David Nkosi',
      preached_at: today,
      category: 'Sunday Service',
      series: 'Foundations',
      description: 'A Sunday message on trusting God one step at a time.',
      duration: '38 min',
      external_url: 'https://example.com/ckc-walking-by-faith',
    });
    if (sermonError) throw new Error(sermonError.message);
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
