# CKC Church App — Supabase Setup (start here)

Follow these steps to connect the app to a real Supabase backend for testing.

## Step 1 — Create Supabase account & project

1. Go to [supabase.com](https://supabase.com) and sign up (**any email** — does not need to match GitHub)
2. Click **New project**
3. Choose a name (e.g. `ckc-church`), set a database password, pick a region close to South Africa (e.g. `eu-west-1`)
4. Wait ~2 minutes for the project to provision

**Cost:** Free tier is enough for you + a few testers (500 MB DB, 50k monthly active users).

## Step 2 — Copy your API keys

In Supabase Dashboard → **Project Settings** → **API**:

| Key | Where to put it |
|-----|-----------------|
| **Project URL** | `NEXT_PUBLIC_SUPABASE_URL` in `.env` |
| **anon public** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env` |
| **service_role** (top secret** | `SUPABASE_SERVICE_ROLE_KEY` in `.env` |

Edit your `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

## Step 3 — Run database migrations

In Supabase Dashboard → **SQL Editor** → **New query**, run each file **in order**:

1. `supabase/migrations/20250619000000_initial_schema.sql`
2. `supabase/migrations/20250619000001_seed_campuses.sql`
3. `supabase/migrations/20250620000000_phone_auth_profiles.sql`
4. `supabase/migrations/20250620000001_seed_demo_data.sql`
5. `supabase/migrations/20250621000000_media_items.sql` ← **sermons / messages**
6. `supabase/migrations/20250622000000_events_prayer_announcements.sql` ← **events, prayer, announcements**
7. `supabase/migrations/20250622000001_rename_loco_to_yoco.sql`
8. `supabase/migrations/20250623000000_super_admin_email_remove_demo_phones.sql`
9. `supabase/migrations/20250623100000_trusted_devices.sql`
10. `supabase/migrations/20250624000000_remove_dummy_contacts.sql` ← **removes fake phones/emails**
11. `supabase/migrations/20250625000000_email_auth_invites.sql` ← **email on invites + invite requests**
12. `supabase/migrations/20250626000000_simplify_email_signup.sql` ← **phone optional on requests/invites**

**Quick check:** paste and run `supabase/check_migrations.sql` — it shows ✓/✗ for each migration plus how many members have email for broadcast.

## Step 4 — Restart the app

```bash
rm -rf .next && npm run dev
```

Open http://localhost:4028

## Step 5 — Test the full pipeline

| Step | Who | Action |
|------|-----|--------|
| 1 | New person | `/request-invite` → **name, surname, email, campus** (no phone) |
| 2 | Admin | Members → Approve & **email** the invite link |
| 3 | New person | Open link → membership form (cell number collected here for SMS broadcasts) |
| 4 | Admin | Approve pending application |
| 5 | Member | `/login` → email → tap **sign-in link** in inbox |

**Auth model**

| Channel | Used for |
|---------|----------|
| **Resend** | Sign-in links, invite emails |
| **BulkSMS** | Group/church SMS broadcasts (uses cell from membership form) |
| **Mailchimp** | Email broadcasts / newsletters only |

No OTP codes to type. Invite link = start signup. Login link = signed in.

**Cleanup after setup:** see [`CLEANUP.md`](./CLEANUP.md) for DB audit, env check, and test checklist.

## What's stored in Supabase now

- Invite requests, invites, membership applications, members, profiles
- Groups, group members, broadcasts, songs
- Campuses (Midrand, Verulam)

## Troubleshooting

| Problem | Fix |
|---------|-----|
| API returns 503 "Backend not configured" | Check all 3 env vars in `.env`, restart dev server |
| Empty invite requests after submit | Check SQL migrations ran; check browser Network tab for errors |
| Can't sign in as demo admin | Re-run seed migration `20250620000001_seed_demo_data.sql` |
| Service role key leaked | Rotate it in Supabase Dashboard → API → Regenerate |

## Next steps (later)

- Verify your church domain in Resend (SPF/DKIM) for reliable OTP delivery
- Verify Mailchimp sender domain for broadcasts (reduce spam folder)
- Event RSVP → visitors table
