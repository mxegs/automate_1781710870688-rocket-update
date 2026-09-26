/**
 * Staging-only multi-household check-in fixture.
 *
 *   node --env-file=.env.staging scripts/fixture-create.cjs
 *
 * Refuses to run unless the Supabase URL contains qtbvagdjgleihyoajkgw.
 * Does not run against live. Does not send email or SMS.
 */
const { createClient } = require('@supabase/supabase-js');
const { randomBytes, scrypt } = require('crypto');
const { promisify } = require('util');
const { writeFileSync, existsSync } = require('fs');
const { resolve } = require('path');

const scryptAsync = promisify(scrypt);

const STAGING_REF = 'qtbvagdjgleihyoajkgw';
const LIVE_REF = 'lmtxevkbrrpnvuzhbetl';
const CHURCH_ID = 'ckc';
const PASSWORD = 'FixtureTest2026';
const EMAIL_SUFFIX = '@fixture-test.example';
const PHONE_PREFIX = '+278200099';
const IDS_PATH = resolve(__dirname, 'fixture-ids.json');

function supabaseUrl() {
  return (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
}

function assertStaging() {
  const url = supabaseUrl();
  if (!url.includes(STAGING_REF)) {
    console.error(
      `Refusing to run: SUPABASE_URL must contain ${STAGING_REF} (staging). Got: ${url || '(empty)'}`,
    );
    process.exit(1);
  }
  if (url.includes(LIVE_REF)) {
    console.error('Refusing to run: this URL is the live project.');
    process.exit(1);
  }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name}`);
    process.exit(1);
  }
  return value;
}

function assertEmail(email) {
  if (!email.endsWith(EMAIL_SUFFIX)) {
    throw new Error(`Fixture email must end with ${EMAIL_SUFFIX}: ${email}`);
  }
}

function assertPhone(phone) {
  if (!phone.startsWith(PHONE_PREFIX)) {
    throw new Error(`Fixture phone must start with ${PHONE_PREFIX}: ${phone}`);
  }
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derived = await scryptAsync(password, salt, 64);
  return `${salt}:${derived.toString('hex')}`;
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function applicationPayload({ personal, dependants, spouseIdNumber, familyGroupId, maritalStatus }) {
  const today = todayDate();
  return {
    submittedAt: new Date().toISOString(),
    personal: {
      todayDate: today,
      surname: personal.surname,
      fullName: personal.fullName,
      username: personal.username,
      campus: personal.campus,
      identityType: 'sa_id',
      identityNumber: personal.identityNumber,
      dateOfBirth: personal.dateOfBirth,
      age: personal.age,
      permanentAddress: 'Fixture address, South Africa',
      email: personal.email,
      cellNo: personal.phone,
      telNo: '',
      gender: personal.gender,
      citizenship: 'RSA',
      countryOfOrigin: 'South Africa',
      maritalStatus,
      occupation: ['Private Sector'],
      occupationOther: '',
      employer: 'Fixture',
      contactName: personal.fullName,
      contactTel: personal.phone,
      idPhotoDataUrl: '',
    },
    guardian: {
      title: '',
      fullName: personal.fullName,
      surname: personal.surname,
      identityNumber: spouseIdNumber || '',
      familyGroupId: familyGroupId || personal.identityNumber,
      relationship: '',
      telHome: '',
      telWork: '',
      streetAddress: '',
      occupation: '',
      organisation: '',
      spouseJoining: spouseIdNumber ? 'Yes' : 'No',
      numberOfDependants: dependants.length || '',
      dependants,
    },
    emergencyContact: {
      name: personal.fullName,
      relationship: 'Self',
      phoneNumber: personal.phone,
    },
    spiritual: {
      acceptedChrist: 'Yes',
      baptized: 'Yes',
      baptismDate: '2018-01-01',
      baptismLocation: 'CKC',
      previousChurchMember: 'No',
      previousChurchName: '',
      previousChurchDate: '',
      previousChurchLocation: '',
      reasonForLeaving: '',
    },
    ministry: {
      areasOfInterest: ["Children's Ministry"],
      spiritualGifts: '',
      ministryPassions: '',
    },
    covenant: {
      agreedToCovenant: true,
      fullName: personal.fullName,
      dateSigned: today,
      signatureDataUrl: '',
    },
  };
}

const PEOPLE = [
  {
    key: 'thabo',
    email: 'thabo-fixture@fixture-test.example',
    phone: '+27820009901',
    surname: 'Mokena',
    given: 'Thabo',
    username: 'thabo_mokena_fixture',
    campus: 'midrand',
    gender: 'Male',
    dateOfBirth: '1988-04-12',
    age: 38,
    identityNumber: '8804125800081',
    maritalStatus: 'Married',
    familyGroupId: 'fixture-mokena',
    spouseIdNumber: '9002204800082',
    dependants: [],
  },
  {
    key: 'sarah',
    email: 'sarah-fixture@fixture-test.example',
    phone: '+27820009902',
    surname: 'Mokena',
    given: 'Sarah',
    username: 'sarah_mokena_fixture',
    campus: 'midrand',
    gender: 'Female',
    dateOfBirth: '1990-02-20',
    age: 36,
    identityNumber: '9002204800082',
    maritalStatus: 'Married',
    familyGroupId: 'fixture-mokena',
    spouseIdNumber: '8804125800081',
    dependants: [
      { name: 'Lerato', surname: 'Mokena', age: 5 },
      { name: 'Thabo Jr', surname: 'Mokena', age: 8 },
    ],
  },
  {
    key: 'nomsa',
    email: 'nomsa-fixture@fixture-test.example',
    phone: '+27820009903',
    surname: 'Dlamini',
    given: 'Nomsa',
    username: 'nomsa_dlamini_fixture',
    campus: 'midrand',
    gender: 'Female',
    dateOfBirth: '1991-07-08',
    age: 35,
    identityNumber: '9107084800083',
    maritalStatus: 'Never Married',
    familyGroupId: 'fixture-dlamini',
    dependants: [
      { name: 'Sipho', surname: 'Dlamini', age: 3 },
      { name: 'Amahle', surname: 'Dlamini', age: 7 },
      { name: 'Kagiso', surname: 'Dlamini', age: 11 },
    ],
  },
  {
    key: 'priya',
    email: 'priya-fixture@fixture-test.example',
    phone: '+27820009904',
    surname: 'Naidoo',
    given: 'Priya',
    username: 'priya_naidoo_fixture',
    campus: 'midrand',
    gender: 'Female',
    dateOfBirth: '1987-11-03',
    age: 38,
    identityNumber: '8711034800084',
    maritalStatus: 'Married',
    familyGroupId: 'fixture-naidoo',
    spouseIdNumber: '8505195800085',
    dependants: [{ name: 'Aarav', surname: 'Naidoo', age: 14 }],
  },
  {
    key: 'rajesh',
    email: 'rajesh-fixture@fixture-test.example',
    phone: '+27820009905',
    surname: 'Naidoo',
    given: 'Rajesh',
    username: 'rajesh_naidoo_fixture',
    campus: 'midrand',
    gender: 'Male',
    dateOfBirth: '1985-05-19',
    age: 41,
    identityNumber: '8505195800085',
    maritalStatus: 'Married',
    familyGroupId: 'fixture-naidoo',
    spouseIdNumber: '8711034800084',
    dependants: [],
  },
  {
    key: 'bongani',
    email: 'bongani-fixture@fixture-test.example',
    phone: '+27820009906',
    surname: 'Khumalo',
    given: 'Bongani',
    username: 'bongani_khumalo_fixture',
    campus: 'midrand',
    gender: 'Male',
    dateOfBirth: '1984-09-01',
    age: 42,
    identityNumber: '8409015800086',
    maritalStatus: 'Never Married',
    familyGroupId: 'fixture-khumalo',
    dependants: [],
  },
  {
    key: 'anna',
    email: 'anna-fixture@fixture-test.example',
    phone: '+27820009907',
    surname: 'Van Der Merwe',
    given: 'Anna',
    username: 'anna_vdm_fixture',
    campus: 'midrand',
    gender: 'Female',
    dateOfBirth: '1989-03-14',
    age: 37,
    identityNumber: '8903144800087',
    maritalStatus: 'Married',
    familyGroupId: 'fixture-vdm',
    spouseIdNumber: '8606285800088',
    dependants: [
      { name: 'Wandi', surname: 'Van Der Merwe', age: 2 },
      { name: 'Pieter', surname: 'Van Der Merwe', age: 6 },
      { name: 'Elsabe', surname: 'Van Der Merwe', age: 10 },
    ],
  },
  {
    key: 'johan',
    email: 'johan-fixture@fixture-test.example',
    phone: '+27820009908',
    surname: 'Van Der Merwe',
    given: 'Johan',
    username: 'johan_vdm_fixture',
    campus: 'midrand',
    gender: 'Male',
    dateOfBirth: '1986-06-28',
    age: 40,
    identityNumber: '8606285800088',
    maritalStatus: 'Married',
    familyGroupId: 'fixture-vdm',
    spouseIdNumber: '8903144800087',
    dependants: [],
  },
  {
    key: 'karabo',
    email: 'karabo-fixture@fixture-test.example',
    phone: '+27820009909',
    surname: 'Molefe',
    given: 'Karabo',
    username: 'karabo_molefe_fixture',
    campus: 'verulam',
    gender: 'Male',
    dateOfBirth: '1983-12-02',
    age: 42,
    identityNumber: '8312025800089',
    maritalStatus: 'Never Married',
    familyGroupId: 'fixture-molefe',
    dependants: [{ name: 'Tebogo', surname: 'Molefe', age: 17 }],
  },
  {
    key: 'fundi',
    email: 'staff-fixture@fixture-test.example',
    phone: '+27820009910',
    surname: 'Mokoena',
    given: 'Fundi',
    username: 'fundi_mokoena_fixture',
    campus: 'midrand',
    gender: 'Female',
    dateOfBirth: '1982-08-16',
    age: 44,
    identityNumber: '8208164800090',
    maritalStatus: 'Never Married',
    familyGroupId: 'fixture-staff',
    role: 'admin',
    dependants: [],
  },
];

async function insertPerson(db, person, passwordHash) {
  assertEmail(person.email);
  assertPhone(person.phone);

  const profileId = crypto.randomUUID();
  const applicationId = crypto.randomUUID();
  const memberId = crypto.randomUUID();
  const officialName = `${person.given} ${person.surname}`;

  const { error: profileError } = await db.from('profiles').insert({
    id: profileId,
    phone: person.phone,
    role: person.role || 'member',
    campus_id: person.campus,
    church_id: CHURCH_ID,
    official_name: officialName,
    username: person.username,
    display_name: person.given,
    email: person.email,
    gender: person.gender,
    date_of_birth: person.dateOfBirth,
    password_hash: passwordHash,
  });
  if (profileError) throw new Error(`${person.email} profile: ${profileError.message}`);

  const { error: appError } = await db.from('membership_applications').insert({
    id: applicationId,
    phone: person.phone,
    campus_id: person.campus,
    church_id: CHURCH_ID,
    status: 'approved',
    application_data: applicationPayload({
      personal: {
        surname: person.surname,
        fullName: officialName,
        username: person.username,
        campus: person.campus,
        identityNumber: person.identityNumber,
        dateOfBirth: person.dateOfBirth,
        age: person.age,
        email: person.email,
        phone: person.phone,
        gender: person.gender,
      },
      dependants: person.dependants,
      spouseIdNumber: person.spouseIdNumber || '',
      familyGroupId: person.familyGroupId,
      maritalStatus: person.maritalStatus,
    }),
    submitted_at: new Date().toISOString(),
    reviewed_at: new Date().toISOString(),
  });
  if (appError) throw new Error(`${person.email} application: ${appError.message}`);

  const { error: memberError } = await db.from('members').insert({
    id: memberId,
    profile_id: profileId,
    application_id: applicationId,
    campus_id: person.campus,
    church_id: CHURCH_ID,
    status: 'active',
    surname: person.surname,
    full_name: officialName,
    username: person.username,
    phone: person.phone,
    email: person.email,
    gender: person.gender,
    date_of_birth: person.dateOfBirth,
    age: person.age,
    marital_status: person.maritalStatus,
    member_since: todayDate(),
    covenant_signed_at: new Date().toISOString(),
  });
  if (memberError) throw new Error(`${person.email} member: ${memberError.message}`);

  return { key: person.key, email: person.email, phone: person.phone, profileId, applicationId, memberId };
}

async function main() {
  assertStaging();
  const url = supabaseUrl();
  const key = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

  if (existsSync(IDS_PATH)) {
    console.error(`Refusing to run: ${IDS_PATH} already exists. Run scripts/fixture-delete.cjs first.`);
    process.exit(1);
  }

  PEOPLE.forEach((person) => {
    assertEmail(person.email);
    assertPhone(person.phone);
  });

  const db = createClient(url, key, { auth: { persistSession: false } });

  const emails = PEOPLE.map((p) => p.email);
  const { data: existing, error: existingError } = await db
    .from('profiles')
    .select('email')
    .in('email', emails);
  if (existingError) throw new Error(existingError.message);
  if (existing?.length) {
    console.error(
      `Refusing to run: fixture emails already exist (${existing.map((r) => r.email).join(', ')}). Run fixture-delete.cjs first.`,
    );
    process.exit(1);
  }

  const passwordHash = await hashPassword(PASSWORD);
  const peopleIds = [];
  for (const person of PEOPLE) {
    peopleIds.push(await insertPerson(db, person, passwordHash));
  }

  const now = new Date();
  const inWindowStart = now.toISOString();
  const inWindowEnd = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
  const endedStart = new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString();
  const endedEnd = new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString();

  const eventAId = crypto.randomUUID();
  const eventBId = crypto.randomUUID();

  const { error: eventAError } = await db.from('events').insert({
    id: eventAId,
    title: 'CKC Sunday Service',
    description: 'Fixture in-window Midrand service.',
    campus_id: 'midrand',
    church_id: CHURCH_ID,
    visibility: 'campus_only',
    category: 'Sunday Service',
    starts_at: inWindowStart,
    ends_at: inWindowEnd,
    is_paid: false,
    reminder_hours_before: 24,
  });
  if (eventAError) throw new Error(`event A: ${eventAError.message}`);

  const { error: eventBError } = await db.from('events').insert({
    id: eventBId,
    title: 'CKC Service Ended',
    description: 'Fixture ended Midrand service.',
    campus_id: 'midrand',
    church_id: CHURCH_ID,
    visibility: 'campus_only',
    category: 'Sunday Service',
    starts_at: endedStart,
    ends_at: endedEnd,
    is_paid: false,
    reminder_hours_before: 24,
  });
  if (eventBError) throw new Error(`event B: ${eventBError.message}`);

  const record = {
    createdAt: new Date().toISOString(),
    churchId: CHURCH_ID,
    password: PASSWORD,
    profileIds: peopleIds.map((p) => p.profileId),
    applicationIds: peopleIds.map((p) => p.applicationId),
    memberIds: peopleIds.map((p) => p.memberId),
    eventIds: [eventAId, eventBId],
    people: peopleIds,
    events: [
      { key: 'in-window', id: eventAId, title: 'CKC Sunday Service' },
      { key: 'ended', id: eventBId, title: 'CKC Service Ended' },
    ],
  };

  writeFileSync(IDS_PATH, `${JSON.stringify(record, null, 2)}\n`);

  console.log('Fixture created on staging.');
  console.log(`Wrote ${IDS_PATH}`);
  console.log(`People: ${peopleIds.length}`);
  console.log(`Events: ${eventAId} (in-window), ${eventBId} (ended)`);
  console.log(`Password for all accounts: ${PASSWORD}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
