#!/usr/bin/env node
/**
 * Set a login password for any profile (super admin, staff, member).
 * Usage: node scripts/set-password.mjs aiwealthlogic@gmail.com YourPassword123
 *
 * Loads .env from project root. Requires migration #13 (password_hash on profiles).
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { createClient } from '@supabase/supabase-js';

const scryptAsync = promisify(scrypt);
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  const envPath = resolve(root, '.env');
  if (!existsSync(envPath)) {
    console.error('Missing .env in project root');
    process.exit(1);
  }
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derived = await scryptAsync(password, salt, 64);
  return `${salt}:${derived.toString('hex')}`;
}

async function main() {
  const email = (process.argv[2] ?? '').trim().toLowerCase();
  const password = process.argv[3] ?? '';

  if (!email.includes('@') || password.length < 8) {
    console.error('Usage: node scripts/set-password.mjs <email> <password-min-8-chars>');
    process.exit(1);
  }

  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required in .env');
    process.exit(1);
  }

  const db = createClient(url, key, { auth: { persistSession: false } });
  const passwordHash = await hashPassword(password);

  const { data: profile, error: findError } = await db
    .from('profiles')
    .select('id, email, role')
    .ilike('email', email)
    .maybeSingle();

  if (findError) {
    console.error(findError.message);
    process.exit(1);
  }
  if (!profile) {
    console.error(`No profile found for ${email}`);
    process.exit(1);
  }

  const { error } = await db
    .from('profiles')
    .update({ password_hash: passwordHash })
    .eq('id', profile.id);

  if (error) {
    console.error(error.message);
    if (error.message.includes('password_hash')) {
      console.error('Run migration 20250627000000_member_password_auth.sql in Supabase first.');
    }
    process.exit(1);
  }

  console.log(`Password set for ${profile.email} (${profile.role}). Sign in at /login with email + password.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
