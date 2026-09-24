# Multi-Tenant Cleanup — Remove CKC assumptions and close the RLS gap

## 🎯 Context

The multi-tenant plumbing works. But three leaks remain:

1. The app silently falls back to 'ckc' when churchId is missing.
2. Staff menu, emails, SMS, and the signup success screen still print
   "Christ Kingdom Citizens" or use CKC's logo.
3. The database still has old "anyone signed in can read" policies
   sitting beside the new tenant policies, so direct queries can cross
   tenants even though the app cannot.

This brief fixes all three, in order. Each is a separate commit.

## 🌿 Branch Rules

- Work ONLY on multi-church.
- Do NOT touch main. Do NOT touch restyle/sacred-modernity.
- Commit each fix as its own commit.
- Do NOT merge. Do NOT push to GitHub until confirmed.

## 🚫 Critical Environment Rules

- Port 4030 is staging. Supabase project: qtbvagdjgleihyoajkgw.
- Port 4028 is the live CKC app. Supabase project: the live one.
- Fix 3 (database rules) MUST run on staging only. NEVER on live.
- No migrations may be applied to live as part of this brief.
- Do NOT deploy any of this to production.

## 🚫 General Rules

- No layout changes. No new screens.
- Only remove CKC assumptions and close the RLS gap.
- Every change must be reversible with git revert.
- If a change requires a migration, test on staging first.

---

## ✅ Fix 1 — Stop the CKC fallback

Goal: The app never silently assumes CKC. If churchId is missing, the
user sees a neutral screen, not a CKC-branded one.

What Cursor must do:

- Search the entire codebase for the pattern:
    churchId ?? 'ckc'
    session?.churchId ?? 'ckc'
    'ckc' (in non-seed, non-migration contexts)

- For each match, decide which of these two patterns replaces it:

  Pattern A — for protected member routes (must know the church):
    If no churchId is present:
      - Redirect to the neutral entry screen (/neutral or /login without
        a slug, whichever route exists).
      - Or show a neutral screen: "We couldn't tell which church you're
        from. Use the link your church sent you."

  Pattern B — for public routes (may or may not know the church):
    If no churchId is present:
      - Render with neutral branding (grey placeholder, no CKC colors).
      - Never fall back to CKC.

- Never use 'ckc' as a fallback in any user-facing code path.
- Seeds and migrations may still reference 'ckc' — those are data, not
  fallbacks.

Deliverable: List every file and line changed. Show the diff. Confirm
no user-facing code path still falls back to 'ckc'.

---

## ✅ Fix 2 — Replace remaining CKC names in staff menu and messages

Goal: No screen, email, or SMS names CKC unless the current church is
actually CKC.

Sub-fix 2a — Staff menu

- Find every hardcoded "CKC", "Christ Kingdom Citizens", or CKC logo
  reference in the staff sidebar and its components.
- Replace with values read from the current church's branding:
  churches.name, churches.logo_url.
- If branding has not loaded yet, render a neutral placeholder (e.g.,
  the word "Church" or a generic icon). Never CKC.

Deliverable: List every file and line changed. Show the diff.

Sub-fix 2b — Emails and SMS templates

- Find every email and SMS template that contains "Christ Kingdom
  Citizens" or "CKC".
- Templates must receive a church_id and look up the church before
  rendering the message body.
- If the plumbing does not exist to pass church_id to the sender:
  - Add it. The sender function should accept church_id as a required
    argument.
  - Callers must pass the church_id from the session or from the event
    that triggered the message (e.g., an event belongs to a church;
    the church_id comes from the event).
- Replace hardcoded CKC strings with the church's name.
- Never fall back to "Christ Kingdom Citizens" — fall back to a
  neutral phrase like "your church" if branding cannot be resolved.

Deliverable: List every template file changed, showing the before and
after for each. List the sender functions whose signatures changed.

Sub-fix 2c — Signup success screen

- Find the signup success screen.
- Currently it uses the CKC logo. It must use the current church's logo
  (churches.logo_url).
- If no logo, render the church name as text instead. Never CKC's logo.
- Confirm the church_id flows from signup through to this screen.

Deliverable: Show the diff.

---

## ✅ Fix 3 — Close the RLS gap (STAGING ONLY)

Goal: The database itself enforces tenant isolation. Even a direct
Supabase query with a signed-in user's token cannot see another
church's data.

WARNING: This step touches database policies. It must be tested on
staging (project qtbvagdjgleihyoajkgw) before any consideration of
production. Do NOT apply to the live CKC database.

Sub-fix 3a — Audit existing policies

- Query pg_policies on staging for every table that has church_id:
  profiles, members, membership_applications, events, event_rsvps,
  sermons, announcements, prayer_requests, groups, ministries,
  visitors, follow_ups, pastoral_care_notes.
- List every policy: table, policy name, command (SELECT/INSERT/etc.),
  and the USING / WITH CHECK expression.
- Classify each as:
  - SAFE: enforces church_id isolation
  - CONFLICTING: "anyone signed in can read" or similar broad rules
  - UNRELATED: not relevant to tenant isolation (e.g., staff-only rules
    that are already scoped by role)

Deliverable: Show the audit table to the user. Do NOT drop anything yet.

Sub-fix 3b — Drop conflicting policies on staging

- After the user reviews the audit, drop only the CONFLICTING policies
  that allow cross-tenant reads.
- Do NOT drop SAFE or UNRELATED policies.
- Create a migration file for staging. Do NOT apply to live.

Deliverable: Show the migration. Ask the user to run it on staging.

Sub-fix 3c — Test on staging

- Using a CKC session, attempt a direct Supabase select on events,
  sermons, members. Confirm only CKC rows return.
- Using a Grace session, do the same. Confirm only Grace rows return.
- Confirm the app still works for both tenants through the UI.

Deliverable: Report the test results.

Sub-fix 3d — If Supabase Auth is not used

- If the app does not use Supabase Auth (auth.uid() is null for all
  requests), RLS cannot isolate per-user. In that case, document this
  clearly in the deliverable and STOP. Do not attempt to fake
  auth.uid(). The user will decide whether to migrate to Supabase Auth
  in a separate brief.

Deliverable: A clear statement: "RLS requires Supabase Auth. The app
currently uses custom auth. RLS is inert until auth is migrated."

---

## 🧪 Testing (mandatory before moving on)

After Fix 1:
- Sign in as Grace member on staging. No CKC name or logo appears.
- Sign out. Reload the app with no session and no slug. A neutral
  screen appears, not CKC.

After Fix 2:
- Staff menu shows the current church's name, not CKC.
- Send a test email and SMS on staging. The body uses the current
  church's name, not CKC.
- Complete a signup on staging. The success screen uses the current
  church's logo, not CKC's.

After Fix 3:
- Direct Supabase query as a CKC token returns only CKC data.
- Direct Supabase query as a Grace token returns only Grace data.
- App still works for both tenants.

## 🚦 Commits

  fix(mt): remove ckc as silent fallback
  fix(mt): replace ckc names in staff menu with tenant data
  fix(mt): pass church_id to email and sms templates
  fix(mt): use tenant logo on signup success
  fix(mt): drop cross-tenant policies on staging

Do NOT merge to main. Do NOT push to GitHub. Wait for confirmation.

## ⚠️ What NOT to do

- Do NOT apply Fix 3 to the live CKC database.
- Do NOT merge to main.
- Do NOT push to GitHub.
- Do NOT touch restyle/sacred-modernity.
- Do NOT change UI layout.
- Do NOT fake auth.uid() to make RLS appear to work.
- Do NOT proceed past Fix 3a without showing the audit to the user.

## 🎯 Success criteria

- No user-facing code path falls back to 'ckc'.
- No screen, email, or SMS prints "Christ Kingdom Citizens" unless the
  current church is actually CKC.
- Database policies on staging enforce tenant isolation at the database
  level, not just the app level — OR the limitation is documented
  clearly if Supabase Auth is not in use.
- Nothing merged to main. Nothing pushed to GitHub. Live CKC database
  untouched.