# Future features notes

Decisions parked for later. Do not treat these as current product behaviour unless the related work has shipped.

---

## Teen self-check-in

**Status:** Not built. Parent-managed check-in (Stage 1) is the current path and stays valid either way.

**Decision (revised):** Whether a 13–17 year old can have their own account is decided by the **parent**, not by the age.

When a parent fills the membership form and reaches the dependants section, if a child’s age falls in 13–17, the form shows an optional checkbox:

```
[ ] Give [Child Name] their own account
    Email: ______
    Phone: ______
```

### If checked

- The application stores `teen_account_consent = true` and the child’s email or phone.
- On approval, the app creates a profile + member row for the teen, with:
  - the collected email/phone
  - `date_of_birth`
  - `guardian_member_id` = the parent
  - `church_id` = parent’s church
  - `is_teen` = true (or derived from `date_of_birth`)
- The teen receives an invite email to set their password.
- The teen can sign in, check in, RSVP, submit prayer requests.
- The teen **cannot** give, cannot edit their profile, cannot initiate chats with adults.
- The parent still sees the teen in their household list, so the parent can check the teen in as a fallback.

### If unchecked

- No teen account is created.
- The teen stays as a dependant only.
- The parent checks them in like any other child.
- No email or phone is collected for the teen.
- If the teen later turns 18, the church can offer them a full member account.

### Why this design

- Respects parental authority. Some parents want their teen to have independence; some do not. The form does not override them.
- Handles both realities (some churches have teens with phones, some do not).
- Maps cleanly to two check-in paths (self vs parent-managed).
- Puts the decision at the moment the parent is already filling the form, not as a separate signup flow.

### Where it applies

- Membership form (dependants section, ages 13–17)
- Membership application JSON (add `teen_account_consent` and teen contact fields per dependant)
- On-approval profile creation
- Check-in logic (self vs parent)
- Feature gating (no giving, no profile editing, chat safeguards)

### When to build

- The form change and account creation happen when we build or revise the membership signup flow.
- The check-in distinction happens after Stage 1 check-in works for the parent-managed case.
- Room defaults: no Teens room in the default table. Ages 13-17 map to null, meaning "attend main service." A church that has a Teens room adds it via per-church room settings (later feature). Until then, teens either attend main service or are handled by their parents' check-in.

**Reference:** This decision was agreed before Stage 1 was built. Stage 1 assumes parents check in all dependants, which is compatible with both outcomes above.

---

## Room settings per church

**Status:** Hardcoded today. Not configurable yet.

**Decision:** room names and age bands are hardcoded today via
`src/lib/events/rooms.ts`. Later, each church should be able to
configure its own rooms and age bands through a settings
screen.

**Why:** churches vary — some call it "Creche," some "Nursery."
Some split 0-2 and 3-5; others combine 0-5. Forcing one
structure on all churches is wrong.

**Where:** `src/lib/events/rooms.ts`, `churches` table (or a
new `church_rooms` table), settings UI.

**When to build:** after check-in works and CKC has used it in
a real service. Not now.

**Structuring note:** `rooms.ts` has `getRoomMap(churchId)`
that currently returns hardcoded defaults. Later, this function
reads from the DB. `roomForChildAge(age, roomMap?)` accepts an
optional map. This keeps the future change to one file.

---

## Membership expiry per church

**Status:** Settings storage and UI are built. Expiry job,
reminders, and renewal flow are pending.

**Decision:** membership duration is a per-church setting.
Columns on `churches`: `membership_duration_days`,
`renewal_reminder_days`, `renewal_final_days`,
`auto_approve_renewals`, `grace_period_days`.
Duration 0 = never expires.

**Why:** churches differ — some want annual, some biennial,
some permanent. Setting per church avoids forcing one policy.

**Where:** `churches` table, membership-settings page, future
renewal logic and reminder emails.

**When to build the reminder job:** after check-in and platform
admin panel are done.

**Note:** the settings storage and UI are already built. Only
the expiry job, reminders, and renewal flow are pending.

---

## Rejection email

**Status:** Not built.

**Decision:** staff need a "Reject application" action that
sends a rejection email. Different tone from approval. Signed
by the church, not the platform.

**Why:** completes the membership loop. Every applicant
deserves a response.

**Where:** staff review panel, email templates.

**When to build:** as part of the membership review flow work —
not urgent now.

---

## Platform admin panel

**Status:** Not built.

**Decision:** a `/platform/churches` page for super admins to
add, edit, and deactivate churches without scripts.

**Why:** currently adding a church requires Cursor and a
script. Unlocks selling to more churches.

**Where:** new staff route, `churches` table, first-admin
invite flow.

**When to build:** after check-in and before onboarding your
first real second church.

---

## Supabase Auth migration

**Status:** Not started. RLS is currently inert.

**Decision:** migrate from custom password_hash to Supabase
Auth before onboarding a paying church. This activates the RLS
policies that are currently inert.

**Why:** closes the last security gap. Enables RLS at the
database level, not just the API layer.

**Where:** `src/lib/auth/session.ts`, login flow, RLS policies,
database tokens.

**When to build:** before first paying church. Not before.

**Reference:** `docs/rls-gap.md` has the details.

---

## Structured names (first, middle, surname)

**Status:** Flat name field today.

**Decision:** today the dependant shape is flat —
`name: string`, `surname: string`. The form asks for "first
name(s)" and "surname" separately, so middle names live inside
the name field.

Later (with the membership form redesign), split into:

```ts
firstName: string;
middleName?: string;
surname: string;
```

**Why:** search, sorting, and telling people apart all work
better when names are structured. Duplicate-name display still
needs campus / age / phone last-4 even after this split.

**Where:** membership form, application JSON, member rows,
staff lists.

**When to build:** with the membership form redesign. Not now.

---

## Tenant isolation audit

**Status:** Isolation is API filters + session church today.
RLS policies exist but are inert (`auth.uid()` is always null
under custom auth).

**Decision:** do not treat database RLS as the isolation
mechanism until Supabase Auth is live. Before a paying church
is onboarded, audit every API route for `church_id` filters
and drop the conflicting `using (true)` policies documented in
`docs/rls-gap.md`.

**Why:** a forgotten filter can leak another church’s rows.
The database will not catch it while RLS is inert.

**Where:** API routes, `docs/rls-gap.md`, RLS policies.

**When to build:** with the Supabase Auth migration, before
the first paying church.

---

## Duplicate-name disambiguation in staff UI

Decision: any staff-facing list or search result that shows
member names must also show at least two of: campus, age,
last 4 digits of phone.
Why: churches commonly have multiple people with the same
name. Picking the wrong one in broadcast sends an SMS to the
wrong person.
Where it applies: /members, /events/[id]/checkins,
/broadcast recipient picker, /pastoral-care note attribution,
/follow-ups.
When to build: as part of each screen's normal
implementation. Add to docs/ui-redesign-todo.md as a
cross-cutting item.
Optional: consider a UNIQUE constraint on
members.identity_number to prevent true duplicates entering
the database.

---

## Staff mobile experience

**Status:** Decision recorded. Full admin is laptop-first.

**Decision:** staff work is designed for a laptop. Two
exceptions must stay usable on a phone: `/events/[id]/checkins`
and `/events/scan`. Other staff screens may render on phone
but are not optimised. A slim mobile staff view is later, only
if a paying church asks.

**Why:** fifteen admin screens will not become phone-friendly
in this pass. Trying to do that now slows the real work.

**Where:** staff chrome, those two event routes, design punch
list.

**When to build a mobile staff subset:** only on demand.

**Reference:** full record in `docs/staff-and-mobile-strategy.md`.
