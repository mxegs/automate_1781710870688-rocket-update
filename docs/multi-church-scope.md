# CKC Multi-Tenant Refactor — Instructions for Cursor

## 🎯 Context

The app currently serves a single church (CKC). We are evolving it into a
multi-tenant SaaS platform where one codebase serves many churches, each
with isolated data and their own branding.

We are NOT rebuilding. We are refactoring in place, phase by phase, without
breaking the existing CKC experience.

## 🌿 Branch Rules (READ FIRST)

- Work ONLY on the branch `multi-church`.
- Do NOT touch `main`. Do NOT merge to `main` until Phase 6 is tested.
- Do NOT touch `restyle/sacred-modernity`. It is a frozen restore point.
- Do NOT create new branches. All work happens on `multi-church`.
- Commit after each phase with a clear message like:
  `feat(mt): add churches table with CKC row`

## 🚫 Global Rules

- Do NOT modify:
  - src/lib/auth/session.ts (except Phase 4, which adds one optional field)
  - src/components/AppShell.tsx
  - src/components/church-life/ChurchLifeShell.tsx
  - src/app/api/events/tickets/verify/route.ts
  - Any existing migration file in supabase/migrations/
- Do NOT rename existing columns or tables. Only add.
- Do NOT delete existing data. Every change is additive.
- Do NOT change existing UI components in Phase 1–4. UI stays identical.
- Match existing conventions: TypeScript, apiFetch, getSupabaseAdmin(),
  ckc-gold/ckc-black/cloud tokens, LifePhoto/LifeHero patterns.
- After each phase, STOP. Wait for the user to test and confirm.
- After each phase, ask the user to run the migration in Supabase staging
  (not production) before proceeding.

## 🧪 Staging Rule

Every migration in this refactor must be tested on a Supabase staging
project before touching the CKC production database. If no staging project
exists, ask the user to create one before Phase 1.

---

## ✅ Phase 1 — Create the churches table

Goal: Add a `churches` table with one row for CKC. Nothing else changes.

What Cursor must do:

- Create a new migration file in supabase/migrations/ named with today's
  date and a clear suffix like `_churches.sql`.
- The table must be called `churches` with columns:
  - `id` (text, primary key) — short slug like 'ckc'
  - `name` (text, not null) — display name like 'Christ Kingdom Citizens'
  - `slug` (text, unique, not null) — URL-safe like 'ckc-midrand'
  - `primary_color` (text, nullable)
  - `secondary_color` (text, nullable)
  - `logo_url` (text, nullable)
  - `app_name` (text, nullable) — what shows in the container app
  - `payfast_merchant_id` (text, nullable)
  - `payfast_vault_key_id` (uuid, nullable)
  - `yoco_public_key` (text, nullable)
  - `yoco_vault_secret_id` (uuid, nullable)
  - `is_active` (boolean, default true)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())
- Insert one row for CKC:
  - id: 'ckc'
  - name: 'Christ Kingdom Citizens'
  - slug: 'ckc-midrand'
  - primary_color: '#C5A073'
  - secondary_color: '#0A0A0A'
- Do NOT add foreign keys to other tables yet.
- Do NOT modify any other table.
- Do NOT modify any code files.

Deliverable: Show the migration file path and full contents. Ask the user
to run it on the staging Supabase project.

Test: App still works exactly as before. CKC still functions. The churches
table exists with one row.

---

## ✅ Phase 2 — Add church_id columns (default 'ckc')

Goal: Add `church_id` to every table that needs tenant isolation, defaulting
to 'ckc' so existing rows belong to CKC automatically.

What Cursor must do:

- Create a new migration that alters these tables, adding a `church_id`
  column to each:
  - profiles
  - members
  - membership_applications
  - events
  - event_rsvps
  - sermons
  - announcements
  - prayer_requests
  - groups
  - ministries
  - visitors
  - follow_ups
  - pastoral_care_notes
- The column definition for each table must be:
  `add column church_id text not null default 'ckc'
   references public.churches(id)`
- Add an index on `church_id` for each table.
- Do NOT change any existing column.
- Do NOT update any existing row manually. The default handles it.
- Do NOT modify any code files.

Deliverable: Show the migration file path and full contents. Ask the user
to run it on staging.

Test: App still works exactly as before. Every existing row now has
church_id = 'ckc'.

---

## ✅ Phase 3 — Filter service functions by church_id

Goal: Update the service layer so all data fetches filter by church_id.
The church_id comes from the session (Phase 4 will add it). For now, pass
it as a parameter and default to 'ckc'.

What Cursor must do:

- Update `src/lib/events/service.ts`:
  - `getMemberEventsFeed({ churchId, memberCampus, isVisitor })` —
    include churchId in the query params.
  - `getAdminEvents({ churchId, campusId, allCampuses })` — same.
- Update `src/lib/sermons/service.ts`:
  - Any feed function gets a `churchId` param, defaults to 'ckc'.
- Update `src/lib/announcements/service.ts`:
  - Same pattern.
- Update `src/lib/prayer/service.ts`:
  - Same pattern.
- Update `src/lib/groups/service.ts`:
  - Same pattern.
- Update `src/lib/members/service.ts`:
  - Same pattern.
- For every service function that fetches data, add the churchId filter.
- Where the fetch goes through an API route, update the route handler in
  `src/app/api/*/route.ts` to accept and apply the churchId filter.
- Every function signature change must be backward compatible: if churchId
  is not provided, default to 'ckc' so existing callers keep working.

Do NOT modify components yet. Do NOT modify session.ts yet.

Deliverable: Show a diff of every changed service file. List the functions
whose signatures changed.

Test: App still works. CKC data loads. Because no other church exists,
nothing visually changes.

---

## ✅ Phase 4 — Add churchId to session

Goal: The current user's session must carry their church_id so downstream
code can filter by it automatically.

What Cursor must do:

- In `src/lib/auth/session.ts`, add one optional field to `AuthSession`:
  `churchId?: string;`
- Update `resolveSessionFromEmailAsync()` and any other session constructor
  to read `churchId` from the profile lookup response.
- Update `fetchProfileByEmail()` and `fetchProfileByPhone()` responses to
  include `churchId` from the `profiles` table.
- In `src/app/api/profiles/lookup-email/route.ts` (and any sibling),
  return `church_id` as `churchId` in the JSON.
- Do NOT change role logic. Do NOT change getPostLoginRoute. Do NOT change
  any other behavior.

Deliverable: Show the diff of session.ts and any touched API routes.

Test: Log in as a CKC member. Confirm session.churchId === 'ckc' in the
browser console (or add a temporary console.log).

---

## ✅ Phase 5 — Row Level Security policies

Goal: Enforce tenant isolation at the database level so a member of
Church A can never query Church B's data, even if the API layer had a bug.

What Cursor must do:

- Create a new migration that, for each table in Phase 2:
  - Enables RLS if not already enabled.
  - Adds a policy `tenant_isolation_read` for SELECT:
    `using (church_id = (select church_id from public.profiles
                        where id = auth.uid()))`
  - Adds a policy `tenant_isolation_write` for INSERT/UPDATE/DELETE:
    `using (church_id = (select church_id from public.profiles
                        where id = auth.uid()))`
- Preserve all existing policies. Add new ones, do not replace.
- For service-role API routes, RLS is bypassed automatically — no change
  needed there. Just make sure the route handlers explicitly filter by
  church_id (from Phase 3).

Deliverable: Show the migration. Ask the user to run it on staging only,
never on production yet.

Test on staging:
- Log in as a CKC member → sees CKC data.
- Manually change that member's profiles.church_id to 'grace-test' in
  Supabase → reload app → they should see nothing (or an empty state).
- Change it back to 'ckc' → data returns.

---

## ✅ Phase 6 — Seed a second test church

Goal: Prove the multi-tenant system works by adding a test church and
confirming the two churches cannot see each other's data.

What Cursor must do:

- Create a seed script `scripts/seed-test-church.cjs` that:
  - Inserts a row into `churches`: id='grace-test',
    name='Grace Test Church', slug='grace-test'.
  - Inserts one profile with church_id='grace-test' and role='member'.
  - Inserts one member with church_id='grace-test'.
  - Inserts one event with church_id='grace-test' for next Sunday.
  - Inserts one sermon with church_id='grace-test'.
- Do NOT run the seed script automatically. Just create it and tell the
  user how to run it.

Deliverable: Show the seed script. Tell the user to run it with
`node --env-file=.env scripts/seed-test-church.cjs`.

Test:
- Log in as CKC member → sees CKC events, CKC sermons, CKC members.
- Log in as the Grace Test member → sees only Grace Test data.
- Neither sees the other's data, in the app or in direct Supabase queries
  from the client.

If both work: the app is multi-tenant. This is the merge point. Merge
`multi-church` into `main`.

If either fails: do not merge. Debug on `multi-church` until it passes.

---

## ✅ Phase 7 — Runtime branding

Goal: The app reads each church's branding (color, logo, name) from the
churches table and applies it at runtime. Before this phase, colors and
logos are hardcoded to CKC's values. After this phase, they come from the
database.

What Cursor must do:

- Create `src/lib/church/service.ts` with:
  - `getChurch(churchId)` — fetches the churches row.
  - `getChurchBranding(churchId)` — returns
    `{ name, primaryColor, secondaryColor, logoUrl, appName }`.
- Create a React context `ChurchBrandingProvider` in
  `src/components/church-life/ChurchBrandingProvider.tsx` that:
  - Accepts `churchId` (from session).
  - Fetches branding on mount.
  - Injects CSS variables onto `document.documentElement`:
    `--ckc-primary`, `--ckc-secondary`, `--ckc-logo-url`.
  - Provides the branding via context for components that need it directly.
- Wrap the member app (`ChurchLifeShell`) in `ChurchBrandingProvider`.
- Update `tailwind.config.js` so `ckc-gold` uses
  `var(--ckc-primary, #C5A073)` and `ckc-black` uses
  `var(--ckc-secondary, #0A0A0A)`.
- Do NOT change any component styling. The fallback values keep CKC
  looking identical. Only when the church config changes does the visual
  change.
- Add a small hook `useChurchBranding()` that returns the current branding.

Deliverable: Show the new files, the tailwind.config.js diff, and the
ChurchLifeShell diff.

Test:
- Log in as CKC member → app still looks identical to today (CKC's
  branding matches the fallback).
- Manually change CKC's `primary_color` in Supabase to '#2E5C8A' →
  reload → the gold accents become blue.
- Change it back.

---

## 🚦 Execution Order

1. Phase 1 — churches table
2. Phase 2 — church_id columns
3. Phase 3 — service filters
4. Phase 4 — session churchId
5. Phase 5 — RLS policies
6. Phase 6 — second church seed and merge to main
7. Phase 7 — runtime branding

After each phase:
- Commit on `multi-church`.
- Run migration on staging.
- Test on staging.
- Report to user.
- Wait for confirmation.

Do NOT proceed to the next phase until the user confirms the previous one.

## 🔄 Rollback Per Phase

- Phase 7: `git revert` the last commit. No DB impact.
- Phase 6: drop the 'grace-test' rows from all tables.
- Phase 5: drop the policies added in Phase 5.
- Phase 4: `git revert` the session.ts commit.
- Phase 3: `git revert` the service changes.
- Phase 2: `alter table X drop column church_id;` for each table.
- Phase 1: `drop table public.churches;`

## ⚠️ What NOT to Do

- Do NOT merge to `main` before Phase 6 is tested.
- Do NOT run Phase 5 (RLS) on production before Phase 6 passes on staging.
- Do NOT rename existing columns. Ever.
- Do NOT delete existing data. Ever.
- Do NOT modify the existing UI in Phase 1–4.
- Do NOT skip the staging tests.
- Do NOT combine phases. One phase, one commit, one test.

## 🎯 Known Simplifications (deferred)

- Payment credentials (PayFast/Yoco) are stored as columns but not wired
  to a giving flow yet. That is a separate brief.
- App icon swapping is a separate brief, done at the container app level.
- Offline sync, seat maps, and tag printing remain deferred from the
  check-in brief.
- Church onboarding wizard is a separate brief, built after Phase 7.

## 🏁 Success Criteria

By the end of Phase 7:

- One codebase serves multiple churches.
- Each church's data is isolated by church_id at the API and RLS layers.
- Each church's branding is configurable without code changes.
- CKC's user experience is unchanged.
- A second test church can use the app without seeing CKC's data.
- The app is ready for the onboarding wizard, payments wiring, and
  white-label distribution.