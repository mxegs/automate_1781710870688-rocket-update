/**
 * Manual run of daily celebration notifications (staging only).
 * node --env-file=.env.staging scripts/birthday-notifications.cjs
 */
const { createClient } = require('@supabase/supabase-js');

const STAGING_REF = 'qtbvagdjgleihyoajkgw';
const LIVE_REF = 'lmtxevkbrrpnvuzhbetl';

function requireStaging() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (!url.includes(STAGING_REF)) {
    console.error('Refuse: not staging');
    process.exit(1);
  }
  if (url.includes(LIVE_REF)) {
    console.error('Refuse: live');
    process.exit(1);
  }
}

async function main() {
  requireStaging();
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing staging supabase env');
    process.exit(1);
  }
  const db = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await db.rpc('create_daily_celebration_notifications');
  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  console.log('inserted', data ?? 0);
}

main();
