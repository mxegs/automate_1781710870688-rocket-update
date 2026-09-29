/**
 * Delete the staging platform suite created by suite-create.cjs.
 * Uses only the ids in scripts/suite-ids.json.
 *
 *   node --env-file=.env.staging scripts/suite-delete.cjs
 *
 * Refuses unless SUPABASE_URL contains qtbvagdjgleihyoajkgw.
 * Refuses live. Never deletes churches ckc or grace-test.
 * Never deletes seed event 98129477-63eb-410d-bbb7-7af8dab2dfda.
 */
const { createClient } = require('@supabase/supabase-js');
const { readFileSync, existsSync, unlinkSync } = require('fs');
const { resolve } = require('path');

const STAGING_REF = 'qtbvagdjgleihyoajkgw';
const LIVE_REF = 'lmtxevkbrrpnvuzhbetl';
const EMAIL_SUFFIX = '@suite-test.example';
const PHONE_PREFIX = '+278200088';
const SEED_EVENT_ID = '98129477-63eb-410d-bbb7-7af8dab2dfda';
const PROTECTED_CHURCHES = new Set(['ckc', 'grace-test']);
const IDS_PATH = resolve(__dirname, 'suite-ids.json');

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
  const removed = [];
  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100);
    const { data, error } = await db.from(table).delete().in('id', chunk).select('id');
    if (error) throw new Error(`${table}: ${error.message}`);
    removed.push(...(data ?? []));
  }
  return removed;
}

async function deleteCheckins(db, eventIds, memberIds) {
  const byEvent = [];
  const byMember = [];
  if (eventIds.length) {
    for (let i = 0; i < eventIds.length; i += 100) {
      const chunk = eventIds.slice(i, i + 100);
      const { data, error } = await db.from('event_checkins').delete().in('event_id', chunk).select('id');
      if (error) throw new Error(`event_checkins by event: ${error.message}`);
      byEvent.push(...(data ?? []));
    }
  }
  if (memberIds.length) {
    for (let i = 0; i < memberIds.length; i += 80) {
      const chunk = memberIds.slice(i, i + 80);
      const { data, error } = await db
        .from('event_checkins')
        .delete()
        .or(`member_id.in.(${chunk.join(',')}),guardian_member_id.in.(${chunk.join(',')})`)
        .select('id');
      if (error) throw new Error(`event_checkins by member: ${error.message}`);
      byMember.push(...(data ?? []));
    }
  }
  return { byEvent, byMember };
}

async function main() {
  assertStaging();
  const url = supabaseUrl();
  const key = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

  if (!existsSync(IDS_PATH)) {
    console.error(`Nothing to delete: missing ${IDS_PATH}. Run suite-create.cjs first.`);
    process.exit(1);
  }

  const record = JSON.parse(readFileSync(IDS_PATH, 'utf8'));
  const profileIds = record.profileIds ?? [];
  const applicationIds = record.applicationIds ?? [];
  const memberIds = record.memberIds ?? [];
  const visitorIds = record.visitorIds ?? [];
  const groupIds = record.groupIds ?? [];
  const groupMemberIds = record.groupMemberIds ?? [];
  const eventIds = (record.eventIds ?? []).filter((id) => id !== SEED_EVENT_ID);
  const rsvpIds = record.rsvpIds ?? [];
  const mediaIds = record.mediaIds ?? [];
  const announcementIds = record.announcementIds ?? [];
  const prayerIds = record.prayerIds ?? [];
  const followUpIds = record.followUpIds ?? [];
  const createdChurchIds = (record.createdChurchIds ?? []).filter((id) => !PROTECTED_CHURCHES.has(id));

  if ((record.eventIds ?? []).includes(SEED_EVENT_ID)) {
    console.error('Refusing to delete: manifest contains the seed event id.');
    process.exit(1);
  }

  for (const person of record.people ?? []) {
    if (person.email && !person.email.endsWith(EMAIL_SUFFIX)) {
      console.error(`Refusing to delete: email is not a suite address: ${person.email}`);
      process.exit(1);
    }
    if (person.phone && !person.phone.startsWith(PHONE_PREFIX)) {
      console.error(`Refusing to delete: phone is not a suite number: ${person.phone}`);
      process.exit(1);
    }
  }

  const db = createClient(url, key, { auth: { persistSession: false } });

  if (profileIds.length) {
    const { data: profiles, error: profileError } = await db
      .from('profiles')
      .select('id, email')
      .in('id', profileIds.slice(0, 100));
    if (profileError) throw new Error(profileError.message);
    for (const row of profiles ?? []) {
      if (!String(row.email || '').endsWith(EMAIL_SUFFIX)) {
        console.error(
          `Refusing to delete: profile ${row.id} email ${row.email} is not a suite address.`,
        );
        process.exit(1);
      }
    }
  }

  const checkins = await deleteCheckins(db, eventIds, memberIds);
  const rsvps = await deleteByIds(db, 'event_rsvps', rsvpIds);
  const prayers = await deleteByIds(db, 'prayer_requests', prayerIds);
  const followUps = await deleteByIds(db, 'follow_ups', followUpIds);
  const announcements = await deleteByIds(db, 'announcements', announcementIds);
  const media = await deleteByIds(db, 'media_items', mediaIds);
  const groupMembers = await deleteByIds(db, 'group_members', groupMemberIds);
  const groups = await deleteByIds(db, 'groups', groupIds);
  const visitors = await deleteByIds(db, 'visitors', visitorIds);
  const events = await deleteByIds(db, 'events', eventIds);
  const members = await deleteByIds(db, 'members', memberIds);
  const applications = await deleteByIds(db, 'membership_applications', applicationIds);
  const profiles = await deleteByIds(db, 'profiles', profileIds);
  const churches = await deleteByIds(db, 'churches', createdChurchIds);

  unlinkSync(IDS_PATH);

  function line(label, rows) {
    console.log(`${label}: ${rows.length ? rows.map((r) => r.id).join(', ') : '(none)'}`);
  }

  console.log('Suite removed from staging.');
  console.log(`event_checkins (by event): ${checkins.byEvent.length}`);
  console.log(`event_checkins (by member): ${checkins.byMember.length}`);
  line('event_rsvps', rsvps);
  line('prayer_requests', prayers);
  line('follow_ups', followUps);
  line('announcements', announcements);
  line('media_items', media);
  line('group_members', groupMembers);
  line('groups', groups);
  line('visitors', visitors);
  line('events', events);
  line('members', members);
  line('membership_applications', applications);
  line('profiles', profiles);
  line('churches (suite-created only)', churches);
  console.log(`Deleted ${IDS_PATH}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
