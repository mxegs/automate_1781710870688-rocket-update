# Tenant From URL — Church identity comes from the link, not a picker

## 🎯 Goal

No church picker. Ever. The church identity is carried by the URL 
the user came in through, or by the invite token, or by the locally 
stored slug from the last session.

This brief covers:
1. How the app resolves the church from the URL
2. How branding loads before the user does anything
3. How signup, invite, and login all carry the church context
4. What the neutral entry point (no slug) looks like

This brief does NOT cover:
- Removing CKC defaults (separate brief)
- Renaming tokens (separate brief)
- RLS (separate brief)

## 🌿 Branch Rules

- Work ONLY on multi-church.
- Do NOT touch main. Do NOT touch restyle/sacred-modernity.
- Commit after each category as a separate commit.
- Do NOT merge to main. Do NOT push to GitHub until confirmed.

## 🚫 Rules

- No church picker screens. Ever.
- No "which church are you part of?" questions.
- The URL, invite token, or stored slug decides the church.
- Every screen that can show branding must load branding before render.
- If branding cannot be resolved, show neutral copy, never CKC.

## ✅ URL structure decision

The user has chosen path-based URLs:

  yourapp.com/ckc-midrand/login
  yourapp.com/ckc-midrand/signup
  yourapp.com/grace-test/login
  yourapp.com/invite/[token]
  yourapp.com/rsvp/[eventId]      (public, no church in URL)
  yourapp.com                     (neutral entry)

Subdomains may be added later. Do not build them now.

## ✅ Category 1 — URL slug resolution

Create src/lib/church/resolve-from-url.ts with:

- A function `extractChurchSlug(pathname: string): string | null`
  that reads the first path segment if it matches a known slug pattern 
  (letters, numbers, hyphens, and it is not a reserved word like 
  'login', 'signup', 'invite', 'member', 'rsvp', 'api', 'dashboard').

- A function `getChurchBySlug(slug: string)` that fetches the churches 
  row and returns `{ id, name, slug, primaryColor, secondaryColor, 
  logoUrl, appName }`.

- A function `resolveCurrentChurch()` that tries, in order:
  1. The slug from the current URL path.
  2. The slug stored in localStorage (from a previous session).
  3. The slug from the invite token if the user is on an invite page.
  4. Returns null if none found.

Deliverable: Show the file.

## ✅ Category 2 — Route structure with church slug

Wrap the member-facing routes so they accept an optional leading slug:

  /:churchSlug/login
  /:churchSlug/signup
  /:churchSlug/signup/complete
  /:churchSlug/member
  /:churchSlug/member/events
  /:churchSlug/member/events/[id]
  /:churchSlug/member/sermons
  ...etc.

When the slug is present:
- Resolve the church from the slug
- Load branding
- Render the page with that branding

When the slug is absent:
- Only /login, /signup, /invite/[token], /rsvp/[eventId] and 
  the root / are allowed
- They render neutral (see Category 5)
- Protected member routes redirect to /login (neutral)

Do NOT break the existing non-slugged routes. Support both during 
transition. The user will switch entirely to slugged URLs later.

Deliverable: Show the route structure diff.

## ✅ Category 3 — Invite flow carries the church

When a user opens /invite/[token]:

- Look up the invite token in the database.
- Read the church_id from the invite row.
- Fetch the church branding.
- Render the invite page with that church's logo, name, and welcome.
- On acceptance, the new profile is created with that church_id.
- After signup, redirect to /:churchSlug/member (using the church's slug).

Never show the neutral screen when the token is valid.

Deliverable: Show the invite route diff.

## ✅ Category 4 — Signup flow carries the church

When a user opens /:churchSlug/signup:

- Resolve the church from the slug.
- Load branding.
- Render the signup form with that church's logo, name, and welcome.
- Save the church_id on the new profile when the form is submitted.
- After signup, redirect to /:churchSlug/member.

Never ask "which church?" — the slug in the URL already decided.

Deliverable: Show the signup route diff.

## ✅ Category 5 — Login flow carries the church

When a user opens /:churchSlug/login:

- Resolve the church from the slug.
- Load branding.
- Render the login form with that church's logo, name, and welcome.
- After login, session carries churchId.
- Redirect to /:churchSlug/member.

When a user opens /login (no slug):

- Try to resolve the church from the locally stored slug.
- If found, redirect to /:churchSlug/login.
- If not found, render a neutral page:
  "Welcome. Please use the link your church sent you to sign in."
  No church picker. No list of churches.

Deliverable: Show the login route diffs.

## ✅ Category 6 — Branding loads before render

Every page that shows branding must:
- Resolve the church first (from URL, invite, or stored slug)
- Fetch branding (or use cache)
- Render with the branding applied
- Never flash CKC's gold as a fallback

If branding fails to load, render a neutral grey/white placeholder 
with the church name as text. Never fall back to CKC's colors.

Update the Phase 7 ChurchBrandingProvider to accept a slug or a 
church object and to render children only after branding is loaded 
(or with a neutral skeleton).

Deliverable: Show the provider diff.

## ✅ Category 7 — Store the slug locally after first visit

When the app successfully resolves a church from a URL or invite:
- Save the slug to localStorage under 'ckc_last_church_slug'
- On future app opens, if no slug is in the URL, use the stored one
- This is what makes the installed app remember its church

Deliverable: Show the storage helper.

## 🧪 Testing on staging (mandatory)

Do not consider this done until all of these pass:

1. Visit /ckc-midrand/login
   - CKC logo and name appear before any user action
   - Login form has CKC's welcome text

2. Visit /grace-test/login
   - Grace Test logo and name appear
   - Login form has Grace's welcome text

3. Visit /invite/[valid-ckc-token]
   - CKC branding appears
   - Accepting the invite creates a profile with church_id = 'ckc'

4. Visit /invite/[valid-grace-token]
   - Grace branding appears
   - Accepting creates a profile with church_id = 'grace-test'

5. Visit /login (no slug) after having logged in before
   - Redirects to the last-used church's login
   - Does NOT show a picker

6. Visit /login (no slug) as a fresh visitor
   - Shows neutral copy: "Please use the link your church sent you"
   - Does NOT show a picker

7. Sign in as Grace member
   - No CKC brand anywhere
   - Page title, logo, color all show Grace

## 🚦 After this passes

Commit each category:
  feat(mt): add church slug resolution from url
  feat(mt): add slugged routes for member app
  feat(mt): carry church through invite flow
  feat(mt): carry church through signup flow
  feat(mt): carry church through login flow
  feat(mt): load branding before render
  feat(mt): remember last church slug locally

Do NOT merge to main. Do NOT push to GitHub. Wait for confirmation.

## ⚠️ What NOT to do

- Do NOT build a church picker screen.
- Do NOT show a list of churches to choose from.
- Do NOT hardcode 'ckc' anywhere as a fallback.
- Do NOT break the existing routes during transition.
- Do NOT merge to main.
- Do NOT push to GitHub.
- Do NOT touch restyle/sacred-modernity.
- Do NOT touch the RLS policies.

## 🎯 Success criteria

After this brief:

- Every URL the user arrives through carries a church identity.
- Login, signup, and invite screens all show the correct church 
  branding before the user does anything.
- No church picker exists anywhere in the app.
- The neutral entry point is polite and clear, not a picker.
- The installed container app remembers its church and opens 
  directly into that church's branded experience.