/**
 * Delete the staging fixture created by fixture-create.cjs.
 * Uses the exact id list in scripts/fixture-ids.json.
 *
 *   node --env-file=.env.staging scripts/fixture-delete.cjs
 *
 * Refuses to run unless the Supabase URL contains qtbvagdjgleihyoajkgw.
 */
const { createClient } = require('@supabase/supabase-js');
const { readFileSync, existsSync, unlinkSync } = require('fs');
const { resolve } = require('path');

const STAGING_REF = 'qtbvagdjgleihyoajkgw';
const LIVE_REF = 'lmtxevkbrrpnvuzhbetl';
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

async function deleteByIds(db, table, ids) {
  if (!ids.length) return [];
  const { data, error } = await db.from(table).delete().in('id', ids).select('id');
  if (error) throw new Error(`${table}: ${error.message}`);
  return data ?? [];
}

async function main() {
  assertStaging();
  const url = supabaseUrl();
  const key = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

  if (!existsSync(IDS_PATH)) {
    console.error(`Nothing to delete: missing ${IDS_PATH}. Run fixture-create.cjs first.`);
    process.exit(1);
  }

  const record = JSON.parse(readFileSync(IDS_PATH, 'utf8'));
  const profileIds = record.profileIds ?? [];
  const applicationIds = record.applicationIds ?? [];
  const memberIds = record.memberIds ?? [];
  const eventIds = record.eventIds ?? [];

  for (const person of record.people ?? []) {
    if (person.email && !person.email.endsWith(EMAIL_SUFFIX)) {
      console.error(`Refusing to delete: email is not a fixture address: ${person.email}`);
      process.exit(1);
    }
    if (person.phone && !person.phone.startsWith(PHONE_PREFIX)) {
      console.error(`Refusing to delete: phone is not a fixture number: ${person.phone}`);
      process.exit(1);
    }
  }

  const db = createClient(url, key, { auth: { persistSession: false } });

  const { data: profiles, error: profileError } = await db
    .from('profiles')
    .select('id, email')
    .in('id', profileIds);
  if (profileError) throw new Error(profileError.message);
  for (const row of profiles ?? []) {
    if (!String(row.email || '').endsWith(EMAIL_SUFFIX)) {
      console.error(`Refusing to delete: profile ${row.id} email ${row.email} is not a fixture address.`);
      process.exit(1);
    }
  }

  let checkinsByEvent = [];
  if (eventIds.length) {
    const { data, error } = await db
      .from('event_checkins')
      .delete()
      .in('event_id', eventIds)
      .select('id');
    if (error) throw new Error(`event_checkins by event: ${error.message}`);
    checkinsByEvent = data ?? [];
  }

  let checkinsByMember = [];
  if (memberIds.length) {
    const { data, error } = await db
      .from('event_checkins')
      .delete()
      .or(`member_id.in.(${memberIds.join(',')}),guardian_member_id.in.(${memberIds.join(',')})`)
      .select('id');
    if (error) throw new Error(`event_checkins by member: ${error.message}`);
    checkinsByMember = data ?? [];
  }

  const events = await deleteByIds(db, 'events', eventIds);
  const members = await deleteByIds(db, 'members', memberIds);
  const applications = await deleteByIds(db, 'membership_applications', applicationIds);
  const removedProfiles = await deleteByIds(db, 'profiles', profileIds);

  unlinkSync(IDS_PATH);

  console.log('Fixture removed from staging.');
  console.log(`event_checkins (by event): ${checkinsByEvent.map((r) => r.id).join(', ') || '(none)'}`);
  console.log(`event_checkins (by member): ${checkinsByMember.map((r) => r.id).join(', ') || '(none)'}`);
  console.log(`events: ${events.map((r) => r.id).join(', ') || '(none)'}`);
  console.log(`members: ${members.map((r) => r.id).join(', ') || '(none)'}`);
  console.log(`membership_applications: ${applications.map((r) => r.id).join(', ') || '(none)'}`);
  console.log(`profiles: ${removedProfiles.map((r) => r.id).join(', ') || '(none)'}`);
  console.log(`Deleted ${IDS_PATH}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
