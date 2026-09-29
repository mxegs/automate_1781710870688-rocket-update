/**
 * Staging-only platform suite fixture (4 churches, load-test scale).
 *
 *   node --env-file=.env.staging scripts/suite-create.cjs
 *
 * Refuses unless SUPABASE_URL contains qtbvagdjgleihyoajkgw.
 * Refuses live. One-shot: refuses if suite-ids.json exists or any
 * @suite-test.example email is present. Manifest written only after
 * every batch succeeds. Failed batch rolls back in-memory ids.
 *
 * Names, emails, phones, and row ids are deterministic for
 * mulberry32 seed "suite-v1" + church_id. Event window timestamps
 * use the clock so in-window tests stay valid.
 */
const { createClient } = require('@supabase/supabase-js');
const { randomBytes, scrypt } = require('crypto');
const { promisify } = require('util');
const { writeFileSync, existsSync } = require('fs');
const { resolve } = require('path');

const scryptAsync = promisify(scrypt);

const STAGING_REF = 'qtbvagdjgleihyoajkgw';
const LIVE_REF = 'lmtxevkbrrpnvuzhbetl';
const EMAIL_SUFFIX = '@suite-test.example';
const PHONE_PREFIX = '+278200088';
const PASSWORD = 'SuiteTest2026';
const SEED_EVENT_ID = '98129477-63eb-410d-bbb7-7af8dab2dfda';
const BATCH = 100;
const IDS_PATH = resolve(__dirname, 'suite-ids.json');
const YEAR = 2026;

const CHURCHES = [
  {
    id: 'ckc',
    key: 'ckc',
    slug: 'ckc-midrand',
    name: 'Christ Kingdom Citizens',
    label: 'CKC',
    phoneBase: 0,
    create: false,
  },
  {
    id: 'grace-test',
    key: 'grace',
    slug: 'grace-test',
    name: 'Grace Test Church',
    label: 'Grace',
    phoneBase: 1000,
    create: false,
  },
  {
    id: 'hope-assembly',
    key: 'hope',
    slug: 'hope-assembly',
    name: 'Hope Assembly',
    label: 'Hope',
    phoneBase: 2000,
    create: true,
  },
  {
    id: 'cornerstone',
    key: 'cornerstone',
    slug: 'cornerstone',
    name: 'Cornerstone',
    label: 'Cornerstone',
    phoneBase: 3000,
    create: true,
  },
];

const MINISTRY_NAMES = [
  'Men of Valor',
  'Women of Destiny',
  'Super Kids',
  'Worship Ministry',
  'Ushers and Protocol',
  'Media',
];

const BUCKETS = [
  {
    id: 'nguni',
    surnames: ['Dlamini', 'Nkosi', 'Ndlovu', 'Sithole', 'Mthembu', 'Zwane', 'Mabaso', 'Khumalo'],
    male: ['Thabo', 'Sipho', 'Sibusiso', 'Mandla', 'Kagiso', 'Tebogo', 'Bongani', 'Themba', 'Lucky', 'Andile'],
    female: ['Nomsa', 'Zanele', 'Busisiwe', 'Nomvula', 'Thandi', 'Fundi', 'Naledi', 'Amahle', 'Lindiwe', 'Precious'],
  },
  {
    id: 'sotho',
    surnames: ['Mokoena', 'Molefe', 'Radebe', 'Mahlangu', 'Sibanda', 'Chikane'],
    male: ['Kabelo', 'Tshepo', 'Lebo', 'Karabo', 'Mpho', 'Thabiso', 'Pule', 'Katleho'],
    female: ['Lerato', 'Refilwe', 'Palesa', 'Dineo', 'Boitumelo', 'Keabetswe', 'Masego', 'Tshepiso'],
  },
  {
    id: 'afrikaans',
    surnames: ['Van Der Merwe', 'Botha', 'Pretorius'],
    male: ['Johan', 'Pieter', 'Riaan', 'Marius', 'Willem', 'Francois', 'Jaco'],
    female: ['Anna', 'Elsabe', 'Chantelle', 'Liesl', 'Marike', 'Sunette', 'Annelie'],
  },
  {
    id: 'indian',
    surnames: ['Naidoo', 'Patel', 'Maharaj'],
    male: ['Rajesh', 'Aarav', 'Yusuf', 'Kiran', 'Dinesh', 'Sanjay'],
    female: ['Priya', 'Aisha', 'Fatima', 'Anaya', 'Meera', 'Shreya'],
  },
  {
    id: 'coloured',
    surnames: ['September', 'Adams', 'Daniels', 'Peterson'],
    male: ['Cedric', 'Winston', 'Shaun', 'Bradley', 'Nathan'],
    female: ['Cheryl', 'Natalie', 'Simone', 'Kayla', 'Megan'],
  },
];

const VISITOR_SOURCES = ['Sunday service', 'Friend', 'Walk-in', 'Social media', 'Outreach'];
const FOLLOW_STAGES = ['cold', 'engaging', 'committed'];

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

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function rng() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rngForChurch(churchId) {
  return mulberry32(hashString(`suite-v1${churchId}`));
}

function uuidFromRng(rng) {
  const bytes = [];
  for (let i = 0; i < 16; i += 1) bytes.push(Math.floor(rng() * 256));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function pick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}

function intBetween(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '');
}

function phoneFor(church, seq) {
  const phone = `${PHONE_PREFIX}${String(church.phoneBase + seq).padStart(4, '0')}`;
  if (!phone.startsWith(PHONE_PREFIX)) {
    throw new Error(`Phone must start with ${PHONE_PREFIX}: ${phone}`);
  }
  return phone;
}

function emailFor(church, given, surname, seq) {
  const email = `${slug(given)}.${slug(surname)}.${church.key}.${String(seq).padStart(3, '0')}${EMAIL_SUFFIX}`;
  if (!email.endsWith(EMAIL_SUFFIX)) throw new Error(`Email suffix: ${email}`);
  return email;
}

function dobFromAge(age, rng) {
  const year = YEAR - age;
  const month = String(intBetween(rng, 1, 12)).padStart(2, '0');
  const day = String(intBetween(rng, 1, 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function identityNumber(dob, gender, seq) {
  const yy = dob.slice(2, 4);
  const mm = dob.slice(5, 7);
  const dd = dob.slice(8, 10);
  const g = gender === 'Female' ? '2' : '5';
  return `${yy}${mm}${dd}${g}${String(seq).padStart(5, '0')}8`;
}

function todayDate() {
  return `${YEAR}-09-26`;
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derived = await scryptAsync(password, salt, 64);
  return `${salt}:${derived.toString('hex')}`;
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
      permanentAddress: 'Suite fixture address, South Africa',
      email: personal.email,
      cellNo: personal.phone,
      telNo: '',
      gender: personal.gender,
      citizenship: 'RSA',
      countryOfOrigin: 'South Africa',
      maritalStatus,
      occupation: ['Private Sector'],
      occupationOther: '',
      employer: 'Suite Fixture',
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
      baptismLocation: 'Suite',
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

function takeName(rng, bucket, gender, used) {
  const pool = gender === 'Male' ? bucket.male : bucket.female;
  for (let i = 0; i < 80; i += 1) {
    const given = pick(rng, pool);
    const surname = pick(rng, bucket.surnames);
    const key = `${given}|${surname}|${gender}`;
    if (!used.has(key)) {
      used.add(key);
      return { given, surname };
    }
  }
  const given = pick(rng, pool);
  const surname = `${pick(rng, bucket.surnames)}${intBetween(rng, 2, 99)}`;
  used.add(`${given}|${surname}|${gender}`);
  return { given, surname };
}

function childNames(rng, bucket, surname, count, used) {
  const kids = [];
  for (let i = 0; i < count; i += 1) {
    const gender = rng() < 0.5 ? 'Male' : 'Female';
    const { given } = takeName(rng, bucket, gender, used);
    kids.push({ given, surname, gender });
  }
  return kids;
}

function makeAdult(church, rng, opts) {
  const {
    seq,
    given,
    surname,
    gender,
    age,
    campus,
    maritalStatus,
    familyGroupId,
    spouseIdNumber,
    dependants,
    role,
    status,
  } = opts;
  const dateOfBirth = dobFromAge(age, rng);
  const identityNumberValue = identityNumber(dateOfBirth, gender, church.phoneBase + seq);
  const officialName = `${given} ${surname}`;
  const username = `${slug(given)}_${slug(surname)}_${church.key}_${String(seq).padStart(3, '0')}`;
  return {
    seq,
    profileId: uuidFromRng(rng),
    applicationId: uuidFromRng(rng),
    memberId: uuidFromRng(rng),
    email: emailFor(church, given, surname, seq),
    phone: phoneFor(church, seq),
    given,
    surname,
    officialName,
    username,
    gender,
    age,
    dateOfBirth,
    campus,
    maritalStatus,
    familyGroupId,
    spouseIdNumber: spouseIdNumber || '',
    dependants: dependants || [],
    identityNumber: identityNumberValue,
    role: role || 'member',
    status: status || 'active',
    churchId: church.id,
  };
}

function dependantsFrom(kids, ages) {
  return kids.map((kid, i) => ({
    name: kid.given,
    surname: kid.surname,
    age: ages[i],
  }));
}

function generateHouseholds(church, rng) {
  const used = new Set();
  const adults = [];
  let seq = 0;
  let hh = 0;
  let coupleKidsIndex = 0;

  const shapes = [
    ...Array(6).fill('couple0'),
    ...Array(9).fill('coupleKids'),
    ...Array(5).fill('single2'),
    ...Array(5).fill('married4'),
    ...Array(5).fill('widowed1'),
    ...Array(3).fill('divorced3'),
    ...Array(2).fill('elderly'),
  ];

  function campusFor() {
    return rng() < 0.15 ? 'verulam' : 'midrand';
  }

  for (const shape of shapes) {
    const bucket = BUCKETS[hh % BUCKETS.length];
    const familyGroupId = `suite-${church.key}-hh${hh}`;
    const campus = campusFor();

    if (shape === 'couple0' || shape === 'coupleKids') {
      const male = takeName(rng, bucket, 'Male', used);
      const femaleGiven = takeName(rng, bucket, 'Female', used).given;
      const husbandAge = intBetween(rng, 32, 48);
      const wifeAge = Math.max(28, husbandAge - intBetween(rng, 1, 5));
      const kidCount =
        shape === 'couple0' ? 0 : coupleKidsIndex++ < 3 ? 4 : 3;
      const ages = kidCount === 4 ? [14, 11, 7, 3] : kidCount === 3 ? [8, 5, 2] : [];
      const kids = kidCount ? childNames(rng, bucket, male.surname, kidCount, used) : [];
      const deps = dependantsFrom(kids, ages);
      const husband = makeAdult(church, rng, {
        seq: seq++,
        given: male.given,
        surname: male.surname,
        gender: 'Male',
        age: husbandAge,
        campus,
        maritalStatus: 'Married',
        familyGroupId,
        dependants: [],
      });
      const wife = makeAdult(church, rng, {
        seq: seq++,
        given: femaleGiven,
        surname: male.surname,
        gender: 'Female',
        age: wifeAge,
        campus,
        maritalStatus: 'Married',
        familyGroupId,
        dependants: deps,
      });
      husband.spouseIdNumber = wife.identityNumber;
      wife.spouseIdNumber = husband.identityNumber;
      adults.push(husband, wife);
    } else if (shape === 'single2') {
      const gender = rng() < 0.7 ? 'Female' : 'Male';
      const name = takeName(rng, bucket, gender, used);
      const kids = childNames(rng, bucket, name.surname, 2, used);
      adults.push(
        makeAdult(church, rng, {
          seq: seq++,
          given: name.given,
          surname: name.surname,
          gender,
          age: intBetween(rng, 26, 42),
          campus,
          maritalStatus: 'Never Married',
          familyGroupId,
          dependants: dependantsFrom(kids, [4, 9]),
        }),
      );
    } else if (shape === 'married4') {
      const gender = rng() < 0.5 ? 'Male' : 'Female';
      const name = takeName(rng, bucket, gender, used);
      const kids = childNames(rng, bucket, name.surname, 4, used);
      adults.push(
        makeAdult(church, rng, {
          seq: seq++,
          given: name.given,
          surname: name.surname,
          gender,
          age: intBetween(rng, 32, 48),
          campus,
          maritalStatus: 'Married',
          familyGroupId,
          dependants: dependantsFrom(kids, [14, 11, 7, 3]),
        }),
      );
    } else if (shape === 'widowed1') {
      const gender = rng() < 0.6 ? 'Female' : 'Male';
      const name = takeName(rng, bucket, gender, used);
      const kids = childNames(rng, bucket, name.surname, 1, used);
      adults.push(
        makeAdult(church, rng, {
          seq: seq++,
          given: name.given,
          surname: name.surname,
          gender,
          age: intBetween(rng, 45, 68),
          campus,
          maritalStatus: 'Widowed',
          familyGroupId,
          dependants: dependantsFrom(kids, [6]),
        }),
      );
    } else if (shape === 'divorced3') {
      const gender = rng() < 0.6 ? 'Female' : 'Male';
      const name = takeName(rng, bucket, gender, used);
      const kids = childNames(rng, bucket, name.surname, 3, used);
      adults.push(
        makeAdult(church, rng, {
          seq: seq++,
          given: name.given,
          surname: name.surname,
          gender,
          age: intBetween(rng, 30, 45),
          campus,
          maritalStatus: 'Divorced',
          familyGroupId,
          dependants: dependantsFrom(kids, [10, 7, 3]),
        }),
      );
    } else {
      const gender = rng() < 0.5 ? 'Male' : 'Female';
      const name = takeName(rng, bucket, gender, used);
      adults.push(
        makeAdult(church, rng, {
          seq: seq++,
          given: name.given,
          surname: name.surname,
          gender,
          age: intBetween(rng, 70, 85),
          campus,
          maritalStatus: rng() < 0.5 ? 'Widowed' : 'Married',
          familyGroupId,
          dependants: [],
        }),
      );
    }
    hh += 1;
  }

  if (adults.length !== 50) {
    throw new Error(`${church.id}: expected 50 adults, got ${adults.length}`);
  }

  const leaderIndex = intBetween(rng, 0, 49);
  const suspendedIndex = (leaderIndex + 1) % 50;
  adults[leaderIndex].role = 'leader';
  adults[suspendedIndex].status = 'suspended';

  // profiles.role values the app reads (not platform aliases church_admin / campus_admin).
  const staffRoles = [
    { role: 'senior_pastor', campus: 'midrand' },
    { role: 'admin', campus: 'midrand' },
    { role: 'pastor', campus: 'verulam' },
    { role: 'administrative_manager', campus: 'midrand' },
  ];
  const staff = staffRoles.map((spec) => {
    const bucket = pick(rng, BUCKETS);
    const gender = rng() < 0.5 ? 'Male' : 'Female';
    const name = takeName(rng, bucket, gender, used);
    return makeAdult(church, rng, {
      seq: seq++,
      given: name.given,
      surname: name.surname,
      gender,
      age: intBetween(rng, 35, 60),
      campus: spec.campus,
      maritalStatus: 'Married',
      familyGroupId: `suite-${church.key}-staff-${spec.role}`,
      dependants: [],
      role: spec.role,
    });
  });

  const visitors = [];
  for (let i = 0; i < 25; i += 1) {
    const bucket = BUCKETS[i % BUCKETS.length];
    const gender = rng() < 0.5 ? 'Male' : 'Female';
    const name = takeName(rng, bucket, gender, used);
    const visitorSeq = seq++;
    visitors.push({
      id: uuidFromRng(rng),
      name: `${name.given} ${name.surname}`,
      surname: name.surname,
      email: emailFor(church, name.given, name.surname, visitorSeq),
      phone: phoneFor(church, visitorSeq),
      campus_id: rng() < 0.2 ? 'verulam' : 'midrand',
      church_id: church.id,
      source: VISITOR_SOURCES[i % VISITOR_SOURCES.length],
      gender,
      marital_status: pick(rng, ['Never Married', 'Married', 'Widowed']),
      accepted_jesus: rng() < 0.7,
      wants_to_join_church: rng() < 0.5,
      event_news_consent: rng() < 0.6,
    });
  }

  return { members: adults, staff, visitors, leader: adults[leaderIndex] };
}

function personRows(person) {
  const officialName = person.officialName;
  const profile = {
    id: person.profileId,
    phone: person.phone,
    role: person.role,
    campus_id: person.campus,
    church_id: person.churchId,
    official_name: officialName,
    username: person.username,
    display_name: person.given,
    email: person.email,
    gender: person.gender,
    date_of_birth: person.dateOfBirth,
  };
  const application = {
    id: person.applicationId,
    phone: person.phone,
    campus_id: person.campus,
    church_id: person.churchId,
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
      spouseIdNumber: person.spouseIdNumber,
      familyGroupId: person.familyGroupId,
      maritalStatus: person.maritalStatus,
    }),
    submitted_at: new Date().toISOString(),
    reviewed_at: new Date().toISOString(),
  };
  const member = {
    id: person.memberId,
    profile_id: person.profileId,
    application_id: person.applicationId,
    campus_id: person.campus,
    church_id: person.churchId,
    status: person.status,
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
  };
  return { profile, application, member };
}

function pickPhones(rng, phones, count) {
  const copy = [...phones];
  const chosen = [];
  while (chosen.length < Math.min(count, copy.length)) {
    const idx = Math.floor(rng() * copy.length);
    chosen.push(copy.splice(idx, 1)[0]);
  }
  return chosen;
}

async function insertBatch(db, table, rows) {
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const { error } = await db.from(table).insert(chunk);
    if (error) throw new Error(`${table}: ${error.message}`);
  }
}

/** Login uses profiles.role. Member sync can overwrite staff to member; re-apply after insert. */
async function applyLoginRoles(db, people) {
  const rows = people.filter((p) => p.role && p.role !== 'member');
  for (const person of rows) {
    const { error } = await db
      .from('profiles')
      .update({ role: person.role })
      .ilike('email', person.email);
    if (error) throw new Error(`profiles.role ${person.email}: ${error.message}`);
  }
}

async function deleteByIds(db, table, ids) {
  if (!ids.length) return;
  for (let i = 0; i < ids.length; i += BATCH) {
    const chunk = ids.slice(i, i + BATCH);
    const { error } = await db.from(table).delete().in('id', chunk);
    if (error) throw new Error(`rollback ${table}: ${error.message}`);
  }
}

async function rollback(db, collected) {
  console.error('Create failed; rolling back in-memory ids (no manifest written).');
  if (collected.eventIds.length) {
    await db.from('event_checkins').delete().in('event_id', collected.eventIds);
  }
  await deleteByIds(db, 'event_rsvps', collected.rsvpIds);
  await deleteByIds(db, 'prayer_requests', collected.prayerIds);
  await deleteByIds(db, 'follow_ups', collected.followUpIds);
  await deleteByIds(db, 'announcements', collected.announcementIds);
  await deleteByIds(db, 'media_items', collected.mediaIds);
  await deleteByIds(db, 'group_members', collected.groupMemberIds);
  await deleteByIds(db, 'groups', collected.groupIds);
  await deleteByIds(db, 'visitors', collected.visitorIds);
  await deleteByIds(db, 'events', collected.eventIds);
  await deleteByIds(db, 'members', collected.memberIds);
  await deleteByIds(db, 'membership_applications', collected.applicationIds);
  await deleteByIds(db, 'profiles', collected.profileIds);
  await deleteByIds(db, 'churches', collected.createdChurchIds);
}

async function main() {
  assertStaging();
  const url = supabaseUrl();
  const key = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

  if (existsSync(IDS_PATH)) {
    console.error(`Refusing to run: ${IDS_PATH} already exists. Run scripts/suite-delete.cjs first.`);
    process.exit(1);
  }

  const db = createClient(url, key, { auth: { persistSession: false } });

  const { data: existing, error: existingError } = await db
    .from('profiles')
    .select('email')
    .like('email', `%${EMAIL_SUFFIX}`)
    .limit(1);
  if (existingError) throw new Error(existingError.message);
  if (existing?.length) {
    console.error(
      `Refusing to run: suite emails already exist. Run scripts/suite-delete.cjs first.`,
    );
    process.exit(1);
  }

  const passwordHash = await hashPassword(PASSWORD);
  const collected = {
    createdChurchIds: [],
    profileIds: [],
    applicationIds: [],
    memberIds: [],
    visitorIds: [],
    groupIds: [],
    groupMemberIds: [],
    eventIds: [],
    rsvpIds: [],
    mediaIds: [],
    announcementIds: [],
    prayerIds: [],
    followUpIds: [],
    people: [],
    events: [],
    churches: [],
  };

  try {
    const churchRows = CHURCHES.filter((c) => c.create).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      primary_color: '#C5A073',
      secondary_color: '#0A0A0A',
      app_name: c.name,
      is_active: true,
    }));
    if (churchRows.length) {
      await insertBatch(db, 'churches', churchRows);
      collected.createdChurchIds.push(...churchRows.map((r) => r.id));
    }

    const allProfiles = [];
    const allApps = [];
    const allMembers = [];
    const allVisitors = [];
    const allGroups = [];
    const allGroupMembers = [];
    const allEvents = [];
    const allRsvps = [];
    const allMedia = [];
    const allAnnouncements = [];
    const allPrayers = [];
    const allFollowUps = [];

    for (const church of CHURCHES) {
      const rng = rngForChurch(church.id);
      const generated = generateHouseholds(church, rng);
      const logins = [...generated.members, ...generated.staff];
      for (const person of logins) {
        person.password_hash = passwordHash;
        const rows = personRows(person);
        rows.profile.password_hash = passwordHash;
        allProfiles.push(rows.profile);
        allApps.push(rows.application);
        allMembers.push(rows.member);
        collected.people.push({
          churchId: church.id,
          email: person.email,
          phone: person.phone,
          role: person.role,
          profileId: person.profileId,
          applicationId: person.applicationId,
          memberId: person.memberId,
        });
        collected.profileIds.push(person.profileId);
        collected.applicationIds.push(person.applicationId);
        collected.memberIds.push(person.memberId);
      }
      for (const visitor of generated.visitors) {
        allVisitors.push(visitor);
        collected.visitorIds.push(visitor.id);
      }

      const now = Date.now();
      const inWindow = {
        id: uuidFromRng(rng),
        key: 'in-window',
        title: `${church.label} Suite In-Window`,
        starts_at: new Date(now).toISOString(),
        ends_at: new Date(now + 2 * 60 * 60 * 1000).toISOString(),
      };
      const ended = {
        id: uuidFromRng(rng),
        key: 'ended',
        title: `${church.label} Suite Ended`,
        starts_at: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
        ends_at: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
      };
      const future = {
        id: uuidFromRng(rng),
        key: 'future',
        title: `${church.label} Suite Future`,
        starts_at: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(),
        ends_at: new Date(now + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      };
      for (const ev of [inWindow, ended, future]) {
        if (ev.id === SEED_EVENT_ID) throw new Error('Generated seed event id — abort');
        allEvents.push({
          id: ev.id,
          title: ev.title,
          description: `Suite ${ev.key} event for ${church.label}.`,
          campus_id: 'midrand',
          church_id: church.id,
          visibility: 'campus_only',
          category: 'Sunday Service',
          starts_at: ev.starts_at,
          ends_at: ev.ends_at,
          is_paid: false,
          reminder_hours_before: 24,
        });
        collected.eventIds.push(ev.id);
        collected.events.push({ churchId: church.id, key: ev.key, id: ev.id, title: ev.title });
      }

      const ticketHolder = generated.members[0];
      const rsvpId = uuidFromRng(rng);
      const ticketCode = `SUITE${church.key.toUpperCase().slice(0, 4)}${String(church.phoneBase).padStart(4, '0')}`;
      allRsvps.push({
        id: rsvpId,
        event_id: inWindow.id,
        church_id: church.id,
        profile_id: ticketHolder.profileId,
        name: ticketHolder.officialName,
        phone: ticketHolder.phone,
        email: ticketHolder.email,
        status: 'going',
        is_visitor: false,
        guests_count: 1,
        payment_status: 'free',
        ticket_code: ticketCode,
      });
      collected.rsvpIds.push(rsvpId);

      for (let s = 0; s < 2; s += 1) {
        const mediaId = uuidFromRng(rng);
        allMedia.push({
          id: mediaId,
          campus_id: s === 0 ? 'midrand' : 'verulam',
          church_id: church.id,
          visibility: s === 0 ? 'campus_only' : 'church_wide',
          media_type: 'sermon',
          title: `${church.label} Suite Sermon ${s + 1}`,
          preacher: generated.staff[0].officialName,
          preached_at: '2026-09-14',
          category: 'Sunday Service',
          description: 'Suite sermon',
          youtube_id: `suite${church.key}${s}`.padEnd(11, 'x').slice(0, 11),
        });
        collected.mediaIds.push(mediaId);
      }

      for (let a = 0; a < 2; a += 1) {
        const announcementId = uuidFromRng(rng);
        allAnnouncements.push({
          id: announcementId,
          campus_id: 'midrand',
          church_id: church.id,
          visibility: 'campus_only',
          title: `${church.label} Suite Announcement ${a + 1}`,
          content: a === 0 ? 'Draft suite notice.' : 'Published suite notice.',
          category: 'General',
          pinned: a === 1,
          status: a === 0 ? 'draft' : 'published',
          repeat_interval: 'none',
          created_by: generated.staff[1].profileId,
        });
        collected.announcementIds.push(announcementId);
      }

      const memberPhones = generated.members.map((m) => m.phone);
      MINISTRY_NAMES.forEach((name, idx) => {
        const groupId = uuidFromRng(rng);
        const lead = generated.members[idx % generated.members.length];
        allGroups.push({
          id: groupId,
          name,
          category: 'ministry',
          campus_id: 'midrand',
          church_id: church.id,
          description: `${name} at ${church.label}`,
          leader_profile_id: lead.profileId,
          leader_phone: lead.phone,
          leader_name: lead.officialName,
          enable_song_library: name === 'Worship Ministry',
        });
        collected.groupIds.push(groupId);
        const phones = [...new Set([lead.phone, ...pickPhones(rng, memberPhones, 5)])].slice(0, 5);
        for (const phone of phones) {
          const gmId = uuidFromRng(rng);
          const member = generated.members.find((m) => m.phone === phone);
          allGroupMembers.push({
            id: gmId,
            group_id: groupId,
            profile_id: member.profileId,
            member_phone: phone,
            role: phone === lead.phone ? 'leader' : 'member',
          });
          collected.groupMemberIds.push(gmId);
        }
      });

      for (let g = 0; g < 2; g += 1) {
        const groupId = uuidFromRng(rng);
        const lead = g === 0 ? generated.leader : generated.members[2];
        const name = g === 0 ? `${church.label} Connect` : `${church.label} Youth`;
        allGroups.push({
          id: groupId,
          name,
          category: 'community',
          campus_id: 'midrand',
          church_id: church.id,
          description: `${name} community group`,
          leader_profile_id: lead.profileId,
          leader_phone: lead.phone,
          leader_name: lead.officialName,
          enable_song_library: false,
        });
        collected.groupIds.push(groupId);
        const phones = [...new Set([lead.phone, ...pickPhones(rng, memberPhones, 5)])].slice(0, 5);
        for (const phone of phones) {
          const gmId = uuidFromRng(rng);
          const member = generated.members.find((m) => m.phone === phone);
          allGroupMembers.push({
            id: gmId,
            group_id: groupId,
            profile_id: member.profileId,
            member_phone: phone,
            role: phone === lead.phone ? 'leader' : 'member',
          });
          collected.groupMemberIds.push(gmId);
        }
      }

      for (let p = 0; p < 3; p += 1) {
        const member = generated.members[p];
        const prayerId = uuidFromRng(rng);
        allPrayers.push({
          id: prayerId,
          campus_id: member.campus,
          church_id: church.id,
          profile_id: member.profileId,
          submitter_name: member.officialName,
          contact_phone: member.phone,
          contact_email: member.email,
          title: `${church.label} Suite Prayer ${p + 1}`,
          description: p === 0 ? 'Confidential suite prayer.' : 'Suite prayer request.',
          category: p === 0 ? 'Health' : 'Family',
          is_confidential: p === 0,
          status: 'new',
        });
        collected.prayerIds.push(prayerId);
      }

      for (let f = 0; f < 3; f += 1) {
        const visitor = generated.visitors[f];
        const followId = uuidFromRng(rng);
        allFollowUps.push({
          id: followId,
          name: visitor.name,
          phone: visitor.phone,
          campus_id: visitor.campus_id,
          church_id: church.id,
          stage: FOLLOW_STAGES[f],
          source: visitor.source,
          last_contact_at: new Date().toISOString(),
        });
        collected.followUpIds.push(followId);
      }

      collected.churches.push({
        id: church.id,
        key: church.key,
        created: church.create,
        leaderEmail: generated.leader.email,
        staff: generated.staff.map((s) => ({ role: s.role, email: s.email })),
      });
    }

    await insertBatch(db, 'profiles', allProfiles);
    await applyLoginRoles(db, collected.people);
    await insertBatch(db, 'membership_applications', allApps);
    await insertBatch(db, 'members', allMembers);
    await insertBatch(db, 'visitors', allVisitors);
    await insertBatch(db, 'events', allEvents);
    await insertBatch(db, 'event_rsvps', allRsvps);
    await insertBatch(db, 'media_items', allMedia);
    await insertBatch(db, 'announcements', allAnnouncements);
    await insertBatch(db, 'groups', allGroups);
    await insertBatch(db, 'group_members', allGroupMembers);
    await insertBatch(db, 'prayer_requests', allPrayers);
    await insertBatch(db, 'follow_ups', allFollowUps);
  } catch (error) {
    try {
      await rollback(db, collected);
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError.message || rollbackError);
      console.error('Collected ids were not written to disk. Inspect staging for leftover @suite-test.example rows.');
    }
    throw error;
  }

  const record = {
    createdAt: new Date().toISOString(),
    password: PASSWORD,
    seed: 'suite-v1',
    createdChurchIds: collected.createdChurchIds,
    profileIds: collected.profileIds,
    applicationIds: collected.applicationIds,
    memberIds: collected.memberIds,
    visitorIds: collected.visitorIds,
    groupIds: collected.groupIds,
    groupMemberIds: collected.groupMemberIds,
    eventIds: collected.eventIds,
    rsvpIds: collected.rsvpIds,
    mediaIds: collected.mediaIds,
    announcementIds: collected.announcementIds,
    prayerIds: collected.prayerIds,
    followUpIds: collected.followUpIds,
    people: collected.people,
    events: collected.events,
    churches: collected.churches,
  };

  writeFileSync(IDS_PATH, `${JSON.stringify(record, null, 2)}\n`);

  console.log('Suite created on staging.');
  console.log(`Wrote ${IDS_PATH}`);
  console.log(`Churches created: ${collected.createdChurchIds.join(', ') || '(none — used existing ckc, grace-test)'}`);
  console.log(`Profiles: ${collected.profileIds.length}`);
  console.log(`Members: ${collected.memberIds.length}`);
  console.log(`Visitors: ${collected.visitorIds.length}`);
  console.log(`Groups: ${collected.groupIds.length}`);
  console.log(`Events: ${collected.eventIds.length}`);
  console.log(`Password for all logins: ${PASSWORD}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
