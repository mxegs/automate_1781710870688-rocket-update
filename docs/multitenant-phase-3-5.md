# Multi-Tenant Phase 3.5 — Wire session.churchId into the screens

## 🎯 Context

Phase 1–5 and 6 are done on staging. The churches table exists, church_id
columns exist, service functions accept churchId, sessions carry churchId,
and RLS policies are in place.

But the screens still call service functions with the default 'ckc' — they
do not pass session.churchId. So a Grace Test member still sees CKC data.

This phase is the bridge. No new tables. No new migrations. Only wire
session.churchId through to the call sites.

## 🌿 Branch Rules

- Work ONLY on multi-church.
- Do NOT touch main. Do NOT touch restyle/sacred-modernity.
- Commit after this phase as:
  `feat(mt): pass session.churchId to church-scoped service calls`
- Do NOT merge to main. Do NOT push to GitHub yet.

## 🚫 Rules

- Additive only. No column renames. No table renames.
- Do NOT change styling or layout.
- Do NOT change component structure.
- Do NOT add new screens.
- Do NOT modify session.ts beyond what already exists.
- If a call site already passes churchId, leave it alone.
- Every change must be reversible with git revert.

## ✅ What Cursor must do

Step A — Identify all call sites of church-scoped service functions.

Search the codebase for these calls:
- getMemberEventsFeed
- getAdminEvents
- getMemberMediaFeed (or equivalent sermon feed)
- Any announcement, prayer, group, ministry, or member feed
- getMyCheckinForToday

List every file and line where these are called.

Step B — For each call site, pass churchId from the session.

Pattern:
  const session = getSession();
  const churchId = session?.churchId ?? 'ckc';
  const data = await getSomeFeed({ churchId, ...otherArgs });

Do NOT remove existing arguments (memberCampus, isVisitor, etc.).
Add churchId alongside them.

Step C — Update resolveMemberCampus (or add resolveMemberChurch)
to return churchId alongside campusId, and use it where the components
currently resolve campus.

Step D — Update API route handlers if they do not already accept the
churchId query param. Phase 3 already added most of this. Verify each
route reads churchId from the query string and applies it to the DB query.

Step E — For the staff/admin side, the same pattern applies. Staff session
carries churchId. Pass it into admin list calls (members, events, sermons).

## 🧪 Test on staging (mandatory)

Do not consider this phase complete until all four of these pass:

1. Log in as a CKC member.
   - Events list shows CKC events only.
   - Sermons list shows CKC sermons only.
   - No Grace Test data appears anywhere.

2. Log in as the Grace Test member
   (member@grace-test.example / GraceTest2026).
   - Events list shows the one Grace event only.
   - Sermons list shows the one Grace sermon only.
   - No CKC data appears anywhere.

3. Direct Supabase query as the CKC member's auth token:
   - `select * from events` returns only CKC rows.
   (RLS should enforce this even if the app misbehaves.)

4. Direct Supabase query as the Grace member's auth token:
   - `select * from events` returns only Grace rows.

If any of the four fails, do NOT mark the phase done. Debug on multi-church.

## 🚦 After this phase passes

- Commit locally on multi-church.
- Tell the user: "Phase 3.5 passes. Ready for Phase 6 proof and merge."
- Do NOT merge to main. Do NOT push to GitHub. Wait for user confirmation.

## ⚠️ What NOT to do

- Do NOT run any migration on the live CKC database.
- Do NOT merge to main.
- Do NOT push to GitHub yet.
- Do NOT touch restyle/sacred-modernity.
- Do NOT change any UI styling.
- Do NOT skip the staging test.

## 🎯 Success criteria

After Phase 3.5:

- CKC member sees CKC data everywhere.
- Grace Test member sees Grace data everywhere.
- No cross-contamination in the app or via direct queries.
- CKC's user experience is visually identical to today.
- All work is committed on multi-church, not merged, not pushed.