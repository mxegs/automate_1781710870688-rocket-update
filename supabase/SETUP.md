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

Click **Run** after pasting each one. You should see “Success” with no errors.

## Step 4 — Restart the app

```bash
rm -rf .next && npm run dev
```

Open http://localhost:4028

## Step 5 — Test the full pipeline

| Step | Who | Action |
|------|-----|--------|
| 1 | New person | Go to `/request-invite` → submit name + phone |
| 2 | Admin (`073 550 2014`) | Members → Invite Requests → Approve & Send Invite |
| 3 | New person | Open invite link → OTP → complete signup wizard |
| 4 | Admin | Members → **Pending Applications** → Approve |
| 5 | New member | Sign in at `/login` with their phone |

**Demo accounts** (seeded in DB):

| Phone | Role |
|-------|------|
| 073 550 2014 | Admin |
| 073 550 2015 | Pastor |
| 073 550 2016 | Worship leader |
| 082 111 2222 | Member |
| `/invite/demo` | Invite demo link |

OTP is still **demo mode** (code shown on screen) until real SMS is wired.

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

- Enable Supabase Phone Auth + Twilio/Africa's Talking for real OTP
- Replace demo OTP with real SMS on invites/broadcasts
- Event RSVP → visitors table
