/**
 * Read-only backup of the live CKC database.
 * Does not insert, update, or delete anything.
 *
 * Run from the app folder:
 *   node scripts/backup-live.cjs
 *
 * Loads .env itself. SUPABASE_URL is used when set. This project's
 * .env names the same value NEXT_PUBLIC_SUPABASE_URL, so that is the
 * fallback. The service role key is read from SUPABASE_SERVICE_ROLE_KEY.
 * The script stops unless the URL contains lmtxevkbrrpnvuzhbetl.
 */
const { createClient } = require('@supabase/supabase-js');
const { createHash } = require('crypto');
const fs = require('fs');
const path = require('path');

const LIVE_REF = 'lmtxevkbrrpnvuzhbetl';
const PAGE_SIZE = 1000;
const REQUESTED_TABLES = [
  'profiles',
  'members',
  'events',
  'media_items',
  'event_rsvps',
  'announcements',
  'invites',
  'membership_applications',
  'visitors',
  'follow_ups',
  'prayer_requests',
  'groups',
  'ministries',
  'pastoral_care_notes',
  'event_checkins',
  'staff',
  'campuses',
];

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;
    const name = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[name] === undefined) process.env[name] = value;
  }
}

function stamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
  ].join('-') + `-${pad(now.getHours())}${pad(now.getMinutes())}`;
}

async function listExposedTables(url, key) {
  const response = await fetch(`${url}/rest/v1/`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/openapi+json',
    },
  });
  if (!response.ok) {
    throw new Error(`Could not list public tables (${response.status})`);
  }
  const spec = await response.json();
  const names = new Set();
  for (const specPath of Object.keys(spec.paths || {})) {
    const name = specPath.replace(/^\//, '').split('/')[0];
    if (name && name !== 'rpc') names.add(name);
  }
  return names;
}

async function fetchAllRows(db, table) {
  const rows = [];
  let from = 0;
  while (true) {
    const { data, error } = await db
      .from(table)
      .select('*')
      .range(from, from + PAGE_SIZE - 1);
    if (error) {
      const missing =
        error.code === 'PGRST205' ||
        error.code === '42P01' ||
        /schema cache|does not exist/i.test(error.message || '');
      if (missing) return null;
      throw new Error(`${table}: ${error.message}`);
    }
    const page = data || [];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
    from += PAGE_SIZE;
  }
}

async function main() {
  loadDotEnv(path.join(__dirname, '..', '.env'));

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl) throw new Error('Missing SUPABASE_URL');
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl.includes(LIVE_REF)) {
    throw new Error(`Refusing to run: SUPABASE_URL is not the live project ${LIVE_REF}`);
  }

  const db = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const exposed = await listExposedTables(supabaseUrl, serviceKey);
  const tables = [...new Set([...REQUESTED_TABLES, ...exposed])].sort();
  const exported = {};
  const manifestTables = {};
  const skipped = [];
  let totalRows = 0;

  for (const table of tables) {
    const rows = await fetchAllRows(db, table);
    if (rows === null) {
      skipped.push(table);
      console.log(`${table}\tmissing`);
      continue;
    }
    const json = JSON.stringify(rows);
    const bytes = Buffer.byteLength(json);
    const sha256 = createHash('sha256').update(json).digest('hex');
    exported[table] = rows;
    manifestTables[table] = { rowCount: rows.length, sha256, bytes };
    totalRows += rows.length;
    console.log(`${table}\t${rows.length} rows\t${bytes} bytes`);
  }

  const when = stamp();
  const backupDir = path.join(__dirname, '..', 'backups');
  fs.mkdirSync(backupDir, { recursive: true });

  const backup = {
    exportedAt: new Date().toISOString(),
    projectRef: LIVE_REF,
    tables: exported,
  };
  const manifest = {
    date: backup.exportedAt,
    projectRef: LIVE_REF,
    tables: manifestTables,
    totalRowCount: totalRows,
    skipped,
  };

  const backupPath = path.join(backupDir, `live-backup-${when}.json`);
  const manifestPath = path.join(backupDir, `live-backup-${when}.manifest.json`);
  fs.writeFileSync(backupPath, `${JSON.stringify(backup, null, 2)}\n`);
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`total\t${totalRows} rows`);
  console.log(`wrote ${backupPath}`);
  console.log(`wrote ${manifestPath}`);
  if (skipped.length) console.log(`skipped (not in database): ${skipped.join(', ')}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
