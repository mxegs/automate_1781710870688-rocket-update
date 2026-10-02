/**
 * Re-time suite fixture events to "now" without recreating rows.
 *
 *   node --env-file=.env.staging scripts/suite-refresh-times.cjs
 *
 * Reads ids from scripts/suite-ids.json. Refuses unless
 * SUPABASE_URL contains qtbvagdjgleihyoajkgw. Refuses live.
 * Never patches seed event 98129477-63eb-410d-bbb7-7af8dab2dfda.
 */
const { createClient } = require('@supabase/supabase-js');
const { readFileSync, existsSync } = require('fs');
const { resolve } = require('path');
const { suiteEventWindows, STAGING_REF, LIVE_REF, SEED_EVENT_ID } = require('./suite-create.cjs');

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

async function main() {
  assertStaging();
  if (!existsSync(IDS_PATH)) {
    console.error(`Missing ${IDS_PATH}`);
    process.exit(1);
  }

  const manifest = JSON.parse(readFileSync(IDS_PATH, 'utf8'));
  const events = Array.isArray(manifest.events) ? manifest.events : [];
  if (!events.length) {
    console.error('suite-ids.json has no events[] entries.');
    process.exit(1);
  }

  const db = createClient(supabaseUrl(), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const windows = suiteEventWindows();
  const updated = [];

  for (const ev of events) {
    if (!ev?.id || !ev.key) continue;
    if (ev.id === SEED_EVENT_ID) {
      console.error(`Refusing to patch seed event ${SEED_EVENT_ID}`);
      process.exit(1);
    }
    const window = windows[ev.key];
    if (!window) {
      console.warn(`Skipping ${ev.id} (${ev.title}): unknown key ${ev.key}`);
      continue;
    }
    const { data, error } = await db
      .from('events')
      .update({ starts_at: window.starts_at, ends_at: window.ends_at })
      .eq('id', ev.id)
      .select('id, title, church_id, starts_at, ends_at')
      .maybeSingle();
    if (error) throw new Error(`${ev.id}: ${error.message}`);
    if (!data) throw new Error(`${ev.id}: not found on staging`);
    updated.push({ key: ev.key, ...data });
  }

  console.log(`Retimed ${updated.length} suite events on staging.`);
  for (const row of updated) {
    console.log(`${row.church_id} ${row.key} ${row.id} ${row.starts_at} → ${row.ends_at}`);
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
