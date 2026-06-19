# CKC Church App — Supabase Setup

## 1. Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Copy **Project URL** and **anon public** key from **Settings → API**

## 2. Add keys to `.env`

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Restart the dev server after changing `.env`.

## 3. Run migrations

### Option A — Supabase Dashboard (easiest)

1. Open **SQL Editor** in your Supabase project
2. Paste and run, in order:
   - `migrations/20250619000000_initial_schema.sql`
   - `migrations/20250619000001_seed_campuses.sql`

### Option B — Supabase CLI

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

## 4. Enable phone auth (when ready)

1. **Authentication → Providers → Phone** → enable
2. Configure SMS provider (Twilio, MessageBird, or Vonage)
3. Or keep demo OTP in the app until Africa's Talking / Twilio is wired

## 5. Tables created

| Table | Purpose |
|-------|---------|
| `campuses` | Midrand, Verulam |
| `profiles` | Login identity + role (links to `auth.users`) |
| `invite_requests` | `/request-invite` queue |
| `invites` | Admin-sent SMS invite links |
| `membership_applications` | Signup wizard JSON |
| `members` | Approved members (filterable) |
| `groups` | Ministries & community groups |
| `group_members` | Group roster |
| `group_broadcasts` | Scheduled leader messages |
| `group_songs` | Song library |
| `follow_ups` | Evangelism pipeline |
| `visitors` | Event / newsletter capture |
| `events` | Church events |
| `event_rsvps` | RSVP records |

## 6. Roles & RLS

- **`super_admin`** — church-wide access
- **`admin` / `pastor`** — campus-scoped (set `profiles.campus_id`)
- **`leader`** — own groups only (`groups.leader_phone` / `leader_profile_id`)
- **`member` / `visitor`** — own profile + member portal data

Row Level Security is enabled on all tables. Invite token lookup may need a **Supabase Edge Function** with service role until users are authenticated.

## 7. Next wiring steps (app code)

1. Replace `src/lib/invites/request-service.ts` → Supabase `invite_requests`
2. Replace `src/lib/invites/service.ts` → Supabase `invites`
3. Wire `SignupWizard` submit → `membership_applications`
4. Replace `src/lib/groups/service.ts` → Supabase groups/broadcasts/songs
5. Swap demo OTP for Supabase phone auth or custom SMS

## 8. Regenerate TypeScript types (optional)

After schema changes:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts
```
