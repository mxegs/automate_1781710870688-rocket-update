# Feature completeness test plan

Plan only. Not executed. No fixture code in this pass. Staging only (`http://localhost:4030`, project `qtbvagdjgleihyoajkgw`). Do not touch live. Do not push until this suite is run and signed off.

Check-in (13 tests) already passed twice on main. Area C is a **short regression**, not a full re-run, unless C1–C4 fail.

Mock-screen product decisions (CONVERT / HIDE / PREVIEW) are in **§5**. Isolation tests are **§3Q**. Fixture shape is **§4**. What stops the pass is **§7**.

---

## 1. Feature inventory

Tick during the pass. `Live` = reads/writes staging DB. `Mock` = hardcoded sample or thank-you with no backend. `Mixed` = both.

### Getting in

- [ ] Church from URL slug (no picker) — **Live**
- [ ] Login branding matches that church — **Live**
- [ ] Membership signup wizard — **Live**
- [ ] Request an invite — **Live**
- [ ] Staff invite → accept token → set password — **Live**
- [ ] Email + password login — **Live**
- [ ] Magic link + `/login/verify` — **Live** (email may be demo-mode)
- [ ] Forgot / reset / change password — **Live**
- [ ] Suspended member cannot sign in — **Live**
- [ ] Post-login landing: member / visitor / staff / leader — **Live**
- [ ] Staff switch to member view — **Live**

### Visitors (not a member)

- [ ] `/visitor` → church info — **Live** (redirect)
- [ ] Church info — **Mixed** (name live; copy/social mostly static)
- [ ] Public sermons — **Live**
- [ ] Public events + visitor RSVP / signup — **Live**
- [ ] Visitor register API writes `visitors` — **Live write**; staff CRM does **not** read it
- [ ] Daily Word — **Mock** → fix: **PREVIEW** (§5)

### Members

- [ ] Home greeting, church, campus — **Live**
- [ ] Check-in hero (ready / checked-in / ended) — **Live**
- [ ] Latest sermon + next event — **Live**
- [ ] Events feed, detail, RSVP — **Live**
- [ ] Self check-in + household (spouse fallback, rooms, campus guard) — **Live** (verified)
- [ ] Security code + kids rooms — **Live**
- [ ] Sermons & messages — **Live**
- [ ] Announcements — **Mixed** (DB or demo fallback)
- [ ] Submit prayer (incl. confidential) — **Live**
- [ ] Give — **Mock** → fix: **HIDE** (§5)
- [ ] Church info — **Mixed**
- [ ] My Groups — **Live**

### Group leaders

- [ ] `/my-groups` — **Live**
- [ ] Group broadcasts — **Live**
- [ ] Song library if enabled — **Live**
- [ ] Broadcast page limited to their group — **Live**

### Staff

- [ ] Member directory + disambiguators — **Live**
- [ ] View / suspend / reactivate / terminate — **Live**
- [ ] Approve / reject applications — **Live** (reject has no email)
- [ ] Invite requests + send invite — **Live**
- [ ] Team & roles — **Live**
- [ ] Membership settings persist — **Live**; expiry **jobs not built**
- [ ] Follow-ups — **Live**
- [ ] Events CRUD + staff check-ins + ticket scan — **Live** (scan: isolation risk)
- [ ] Sermons / announcements / prayer inbox / broadcast — **Live**
- [ ] Dashboard — **Mixed** → fix: **CONVERT** numbers, **HIDE** fake lists (§5)
- [ ] Visitors CRM — **Mock** → fix: **CONVERT**
- [ ] Ministries — **Mock** → fix: **HIDE**
- [ ] Pastoral care — **Mock** → fix: **HIDE**
- [ ] Reports — **Mock** → fix: **HIDE**

### Isolation (user-visible)

- [ ] Session church must match `churchId` or 404 — **Live** (API only; RLS inert)
- [ ] Four suite churches cannot see each other’s rows — **Live**

---

## 2. Test areas

| Area | Live / mock | Notes |
| --- | --- | --- |
| A Auth | Live | Signup, invite, login, magic link, forgot password, suspend |
| B Member home and daily content | Mixed | Home live; Daily Word mock; Give mock; announcements demo fallback |
| C Events and check-in | Live | Regression of the verified 13-test suite |
| D Sermons | Live | Publish + visibility |
| E Prayer | Live | Member submit; staff inbox |
| F Announcements | Mixed | Staff live; member live or demo |
| G Groups | Live | Staff, leader, member |
| H Membership applications | Live | Apply, approve, reject, suspend |
| I Follow-ups | Live | Stages + outbound (fixture phones only) |
| J Broadcast | Live | Preview first; send only if 100% suite addresses |
| K Giving | Mock | Confirm no DB write; then HIDE per §5 |
| L Staff dashboard | Mixed | Confirm live vs mock; then CONVERT/HIDE per §5 |
| M Visitors CRM | Mock UI | Table exists; page ignores it; CONVERT |
| N Ministries | Mock | HIDE |
| O Pastoral care | Mock | HIDE |
| P Reports | Mock | HIDE |
| Q Multi-tenant isolation | Live APIs | Numbered tests across every live area |

---

## 3. Tests per area

Shared later (not created now): staging `http://localhost:4030`; password `FixtureTest2026`; emails `*@suite-test.example`; phones `+278200088…`. Four churches: CKC, Grace Test, Hope Assembly, Cornerstone (§4).

Church A in tests below = **CKC** unless a test names another church.

---

### A. Auth

**Data required:** All four church slugs branded. Per church: one approved member with password, one suspended member. CKC extra: unused email for signup, invite-request path, one profile with no password (magic-link only). Staff who can send invites.

| # | Test | Expected |
| --- | --- | --- |
| A1 | Open `/ckc-midrand/login` | CKC name/branding, not Grace/Hope/Cornerstone |
| A2 | Open `/grace-test/login` (and Hope / Cornerstone slugs once created) | That church’s branding only |
| A3 | Password login as approved CKC member | Session; land on `/member` |
| A4 | Wrong password | Error; no session |
| A5 | Login as suspended member | Blocked (“membership is suspended”) |
| A6 | Magic link for approved email | `ok`; verify token signs in (demo link allowed) |
| A7 | Magic link for unknown email | 403 / not allowed |
| A8 | Forgot password → set new → login | New password works |
| A9 | Change password while signed in | Old fails; new works |
| A10 | Signup wizard on CKC slug, submit | Application `submitted`, `church_id = ckc` |
| A11 | Same person/email must not become a member of another church by this signup | Application stays on the slug’s church only |
| A12 | Request invite on CKC | Visible to CKC staff only |
| A13 | Staff send invite → accept token → set password | Login works on that church only |
| A14 | Staff in member view | Staff routes hidden; member home works |

**Outcome class:** Live. Failures here are **blockers** (§7).

---

### B. Member home and daily content

**Data required:** Approved member; one published sermon; in-window event; one published announcement (for B9). Optionally a church with zero announcements (B8 demo fallback).

| # | Test | Expected |
| --- | --- | --- |
| B1 | Home greeting + church line | Correct church name and campus |
| B2 | Latest sermon card | That church’s sermon, not another church’s title |
| B3 | Next event card | That church’s event (prefer in-window over ended) |
| B4 | Check-in hero | Ready or checked-in for in-window; not the ended event |
| B5 | Daily Word | Hardcoded “Foundations of faith” lessons (mock). After §5: labelled **PREVIEW** or not in nav |
| B6 | Give submit | Thank-you on screen; **no** giving/payments row in DB. After §5: item **HIDDEN** |
| B7 | Church info | Loads; social links may still be generic placeholders (parkable) |
| B8 | Announcements with empty DB | Demo posts (`demo-welcome`); must not look like that church published them (parkable until labelled) |
| B9 | After staff publish | Real title appears; demo unused |

**Outcome class:** B1–B4, B9 live. B5–B6 mock. B7 mixed. B8 demo fallback.

---

### C. Events and check-in

**Already verified 13/13.** This pass is a regression. If C1–C4 fail, stop and re-run the full 13-test contract from the check-in fixture docs.

**Data required (CKC):** Spouse-fallback household; Verulam member vs Midrand `campus_only` in-window event; staff; ended event; RSVP/ticket event; visitor signup path.

| # | Test | Expected |
| --- | --- | --- |
| C1 | Member check-in `useHousehold: true` (kids on spouse app) | Dependants from spouse; rooms by age |
| C2 | Verulam member → Midrand `campus_only` event | 404 |
| C3 | Staff list after those check-ins | Count matches rows created |
| C4 | `/today` while in-window | In-window event id, not ended |
| C5 | Member RSVP | RSVP row; ticket code if issued |
| C6 | Scan that ticket twice | First `valid: true`; second already-scanned |
| C7 | Visitor event signup | RSVP and/or `visitors` insert |
| C8 | Full 13-test suite | Only if C1–C4 fail; contract unchanged from last PASS |

**Outcome class:** Live. C2/C1 failures are **blockers**. C6 isolation is also Q (ticket route has no session church today).

---

### D. Sermons

**Data required:** Per church: 2 sermons (titles unique per church). CKC extra for visibility: one `campus_only` Midrand, one church-wide or visitor-visible (fixture proposes 2 each; CKC tests may use campus vs visitor on those two). Staff who can create/delete.

| # | Test | Expected |
| --- | --- | --- |
| D1 | CKC staff create sermon (YouTube id, campus, visibility) | Appears in CKC admin list only |
| D2 | Midrand member feed | Sees Midrand campus-only + church-wide; not Verulam-only |
| D3 | Visitor / public feed | Only visitor-visible items |
| D4 | Grace (and Hope, Cornerstone) member feed | Only that church’s titles |
| D5 | CKC staff delete | Gone from CKC member feed; other churches unchanged |
| D6 | Member requests another church’s sermon id | 404 (also Q1) |

**Outcome class:** Live.

---

### E. Prayer

**Data required:** Seed 3 prayer rows per church (one confidential). Plus one created during the test by a member. Staff inbox access.

| # | Test | Expected |
| --- | --- | --- |
| E1 | CKC member submits a new request | Row in `prayer_requests`, `church_id = ckc` |
| E2 | CKC staff inbox | Sees E1 and CKC seed rows; can status assigned → in_prayer → answered |
| E3 | Confidential seed row | Visible to CKC staff; not on member home or another church |
| E4 | Hope / Grace / Cornerstone staff inbox | No CKC titles or names |
| E5 | Dashboard prayer widget | Still hardcoded (L4) — **not** this inbox |

**Outcome class:** Live (inbox). Dashboard widget mock until §5.

---

### F. Announcements

**Data required:** 2 per church (one draft, one published campus-only or similar). Midrand + Verulam members on CKC.

| # | Test | Expected |
| --- | --- | --- |
| F1 | Staff create draft | Not on member feed |
| F2 | Publish + pin, `campus_only` Midrand | Midrand member sees it; Verulam member does not |
| F3 | Publish church-wide (or second fixture row if already church-wide) | Both campuses on that church see it |
| F4 | Other churches’ members | No CKC announcement titles |
| F5 | Delete / expire | Disappears from member feed |
| F6 | Empty-DB demo fallback | Same as B8; parkable copy, not a tenant leak |

**Outcome class:** Staff live. Member live when rows exist.

---

### G. Groups (leader + member)

**Data required:** 2 groups per church; one has a leader (`role = leader`) and member phones; optional song library on one CKC group.

| # | Test | Expected |
| --- | --- | --- |
| G1 | CKC staff create/edit group, assign leader + members | Group `church_id = ckc` |
| G2 | Leader `/my-groups` | Only groups they lead at their church |
| G3 | Leader posts a group broadcast | Stored; other church leaders do not receive it (Q3) |
| G4 | Song library when enabled | Save song; send-to-band does not 500 |
| G5 | Ordinary member | Cannot open staff `/groups`; My Groups nav only if they belong |
| G6 | Leader opens `/members` or `/reports` | Guard / redirect |
| G7 | Leader loads another church’s `groupId` | 404 |

**Outcome class:** Live. `/small-groups` only redirects to `/groups`.

---

### H. Membership applications (apply, approve, reject, suspend)

**Data required:** Signup path (A10). Two submitted applications on CKC (approve / reject). One approved member to suspend. Pending list on a second church.

| # | Test | Expected |
| --- | --- | --- |
| H1 | CKC staff pending list | Only CKC `submitted` apps |
| H2 | Approve | Status approved; member + profile; can log in; approval email/SMS (demo ok) |
| H3 | Reject | Status `rejected`; **no** login; **no** rejection email (known gap — park in notes, not a leak) |
| H4 | Other church pending list | No CKC applications |
| H5 | Suspend approved member | Login blocked (A5) |
| H6 | Reactivate | Login works |
| H7 | Terminate | Not an active member; confirm UI status |
| H8 | Directory disambiguators | Campus · age · last-4 |
| H9 | Membership settings save | Persist on that church only; duration `0` = no expiry. Reminder **job not built** (parkable) |

**Outcome class:** Live. Expiry jobs and rejection email are parkable.

---

### I. Follow-ups

**Data required:** 3 follow-ups per church, three stages (e.g. cold / engaging / committed). Fixture phones only.

| # | Test | Expected |
| --- | --- | --- |
| I1 | CKC staff list | CKC rows only |
| I2 | Filter campus / stage | Matching rows only |
| I3 | Change stage | Persists after reload |
| I4 | Send to fixture number | Demo or success; **never** a real congregant. Skip billed SMS if needed and record SKIP |
| I5 | Other church staff | No CKC contacts |

**Outcome class:** Live. I4 skip is allowed if send is unsafe; preview/list tests still required.

---

### J. Broadcast

**Data required:** Known member counts per church (10 members + staff/leader as in §4). One group roster. Suite emails/phones only.

| # | Test | Expected |
| --- | --- | --- |
| J1 | CKC staff preview `members` + campus filter | Count matches **CKC** fixture members only (Q4) |
| J2 | Preview `group` | Count matches that group’s roster |
| J3 | Leader on Broadcast | Their group only, not all church members |
| J4 | Send | Allowed only if audience is 100% `@suite-test.example` / `+278200088`; other churches excluded |
| J5 | Hope/Grace/Cornerstone preview | That church’s count only |

**Outcome class:** Live. Default this pass: **preview**. Send is optional and fixture-only.

---

### K. Giving

**Data required:** Any signed-in member. No payment provider.

| # | Test | Expected |
| --- | --- | --- |
| K1 | Submit tithe/offering form | Thank-you; amount shown |
| K2 | Database | No giving/payments/ledger write |
| K3 | Isolation | N/A (no tenant data) |
| K4 | After §5 HIDE | Give not in member nav; route does not look like a completed gift |

**Today:** Mock. **Fix:** **HIDE** (§5). This pass still runs K1–K2 to prove there is no DB write.

---

### L. Staff dashboard

**Data required:** Staff on two churches; real member/event counts that **do not** equal 342 / 18 / 27.

| # | Test | Expected |
| --- | --- | --- |
| L1 | Open `/dashboard` as staff | Page loads |
| L2 | KPI cards “342 members”, “18 visitors”, “27 prayers” | Unchanged when fixture counts differ → **mock** |
| L3 | Recent visitors | Hardcoded names (`Lerato Dlamini`, …) → **mock** |
| L4 | Prayer widget | Hardcoded → **mock** (not E inbox) |
| L5 | Upcoming events | Real events for **this** church → **live** |
| L6 | Other church dashboard upcoming | That church’s events only |

**Today:** Mixed. **Fix:** **CONVERT** stat cards to real counts; **HIDE** fake visitor and prayer lists until those modules are live (§5).

---

### M. Visitors CRM

**Data required:** C7 visitor signup row in `visitors`. Staff on two churches.

| # | Test | Expected |
| --- | --- | --- |
| M1 | `/visitors` | Eight `@ckc-sample.test` people, independent of DB |
| M2 | After C7 | New visitor **does not** appear |
| M3 | Other church staff | **Same** mock names (looks like shared data; it is fake) |
| M4 | After §5 CONVERT | Page lists `visitors` for session church only; mock names gone |

**Today:** Mock UI; live writes elsewhere. **Fix:** **CONVERT** (wire to `visitors`). Until then the screen must not ship as ops (**HIDE** interim if CONVERT slips).

---

### N. Ministries

**Data required:** Staff on two churches.

| # | Test | Expected |
| --- | --- | --- |
| N1 | `/ministries` | Six hardcoded ministries |
| N2 | Any create/edit on the page | No DB persist |
| N3 | Other church | Same mock list |
| N4 | After §5 HIDE | Not in staff nav |

**Today:** Mock. **Fix:** **HIDE**.

---

### O. Pastoral care

**Data required:** Staff on two churches.

| # | Test | Expected |
| --- | --- | --- |
| O1 | `/pastoral-care` | Hardcoded cases (hospital, counseling, …) |
| O2 | Status filters | Filter the mock array only |
| O3 | Other church | Same mock list |
| O4 | After §5 HIDE | Not in staff nav |

**Today:** Mock. **Fix:** **HIDE**.

---

### P. Reports

**Data required:** Staff; add a member and reload.

| # | Test | Expected |
| --- | --- | --- |
| P1 | KPI 342 and charts | Hardcoded Recharts data |
| P2 | Tabs | Sample only |
| P3 | Add members, reload | Numbers do not change |
| P4 | After §5 HIDE | Not in staff nav |

**Today:** Mock. **Fix:** **HIDE**.

---

### Q. Multi-tenant isolation

Isolation today is **API `church_id` + `X-Session-Email`**, not RLS (`docs/rls-gap.md`). Run after A3 works. Use unique titles (`CKC Suite Sermon` vs `Hope Suite Sermon`) so a leak is obvious.

**Data required:** All four churches populated per §4. Pairwise checks can use CKC vs Hope as the main leak pair, then spot-check Grace and Cornerstone.

| # | Test | Expected |
| --- | --- | --- |
| Q1 | Church A member requests Church B sermon id (GET by id / feed) | 404 or empty; never Church B body |
| Q2 | Church A staff lists members | Only Church A; count matches that church’s fixture people |
| Q3 | Church A leader broadcasts to their group | Church B leaders do not receive; Church B group unchanged |
| Q4 | Church A admin previews broadcast audience | Count matches only Church A |
| Q5 | Church A member submits prayer | Only Church A staff inbox (see E) |
| Q6 | Every GET that takes `churchId` (or equivalent), called with Church A session + Church B id | 404. Cover at least: events, sermons, announcements, prayer, members, groups, follow-ups, staff, membership-applications, checkins/today, membership-settings |
| Q7 | Every POST/PATCH/DELETE that takes `churchId` or a foreign row id, Church A session acting on Church B | 404; no row created/updated on Church B |
| Q8 | Cross-campus **within** one church | `campus_only` Midrand event rejects Verulam member (C2). Church-wide events allowed |
| Q9 | Check-in on Church A event | Does not appear in Church B staff check-in list (already verified in spirit; re-check with suite events) |
| Q10 | Fixture events, members, sermons, announcements, groups, follow-ups, prayers on staging | Visible only on their own church slug/session |
| Q11 | Missing `X-Session-Email` on those APIs | 404; no CKC dump |
| Q12 | Ticket verify `/api/events/tickets/verify` with Church A ticket, no session / other church | **Known risk:** no `requireSessionChurch` today. Record actual result. Leak = **blocker** |
| Q13 | Visitor register lookup by email only | **Known risk:** may not be church-scoped. Record actual result. Cross-church overwrite = **blocker** |

**Outcome class:** Live. Any unexpected cross-church row is a **blocker** (§7).

---

## 4. Fixture needs

One suite. Do **not** implement in this pass.

### Safety (same pattern as check-in fixture)

| Rule | Detail |
| --- | --- |
| Create | `node --env-file=.env.staging scripts/suite-create.cjs` |
| Delete | `node --env-file=.env.staging scripts/suite-delete.cjs` |
| Staging only | Refuse unless `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` contains `qtbvagdjgleihyoajkgw` |
| No live | Refuse if URL contains `lmtxevkbrrpnvuzhbetl` |
| Emails | Must end `@suite-test.example` (not `@fixture-test.example`) |
| Phones | Must start `+278200088` (not `+278200099`) |
| Manifest | Writes `scripts/suite-ids.json` (gitignored, like check-in ids) |
| Create refuse | If manifest exists or any suite email already present |
| Delete | Only ids in the manifest; print every removed id; then delete the manifest |
| Password | `FixtureTest2026` for every suite login |
| Seed events | Do not delete CKC seed Sunday Service `98129477-…` |
| Existing churches | Do not delete `ckc` or `grace-test` churches; only suite rows on them |
| New churches | Hope Assembly and Cornerstone are **created by the suite** and **removed on delete** |

### Churches on staging: 4

| # | Name | `church_id` (proposed) | Slug | Origin |
| --- | --- | --- | --- | --- |
| 1 | CKC | `ckc` | `ckc-midrand` | Already on staging; **add** suite rows only |
| 2 | Grace Test | `grace-test` | `grace-test` | Already on staging; **add** suite rows only |
| 3 | Hope Assembly | `hope-assembly` | `hope-assembly` | **Created by suite** |
| 4 | Cornerstone | `cornerstone` | `cornerstone` | **Created by suite** |

Campus ids in the app are still global `midrand` / `verulam` (not per church). Suite households still use those two ids so campus_only tests work. Hope/Cornerstone are for **tenant** isolation, not realistic geography.

### Per church (all four)

| Item | Count | Notes |
| --- | --- | --- |
| Members | **10** | Varied households (below). Approved, with password, unless noted |
| Staff | **2** | 1 campus admin (`admin`), 1 church-wide (`administrative_manager` or senior pastor) |
| Leader | **1** | `role = leader`, leads one of the two groups |
| Events | **3** | In-window, ended, future. Unique titles per church |
| Sermons | **2** | Unique titles per church |
| Announcements | **2** | e.g. 1 draft + 1 published |
| Prayer requests | **3** | **One confidential** |
| Groups | **2** | Exactly one has the leader + member phones |
| Follow-ups | **3** | Three statuses (cold / engaging / committed) |

Staff and leader are **in addition to** the 10 members (13 logins per church), unless a later implementer folds them into the 10 — the test counts above assume 10 member-directory people plus 2 staff plus 1 leader.

### Household mix (inside the 10 members, same pattern each church, different names)

1. Spouse-fallback couple (kids on one application only) — 2 members  
2. Single parent + three kids on the application (Preschool / Kids / Tweens) — 1 member  
3. Adult only, Midrand — 1  
4. Adult, Verulam (campus_only 404) — 1  
5. Remaining seats: mix of adult-only and one teen-dependant household (room null) so directory and Adults bucket have volume — fill to 10  

One of the 10 (or a named extra) **suspended**. Two **submitted** applications (no login) per church for H2/H3 can sit outside the 10.

### Naming so leaks are obvious

Every event/sermon/announcement/group title includes the church key, e.g. `CKC Suite In-Window`, `Hope Suite Sermon 1`.

### Order-of-magnitude

4 churches × (~13 logins + 2 apps + 3 events + 2 sermons + 2 announcements + 3 prayers + 2 groups + 3 follow-ups). Delete must print every id. If create becomes too large, shrink Hope/Cornerstone to the isolation minimum (staff + 2 members + 1 event + 1 sermon) **only after** you say so — this plan uses the full 4× grid as proposed.

---

## 5. Mock screens — decide the fix

One of: **[CONVERT]** wire to real DB · **[HIDE]** remove from UI until built · **[PREVIEW]** keep, visible “preview/sample” label.

Unlabelled mock in a **live-facing** view is a **blocker** (§7).

| Surface | Decision | Why |
| --- | --- | --- |
| **Daily Word** (`/member/bible-study`) | **[PREVIEW]** | Keep the shell for a later lessons CMS. Fake “this week’s teaching” must not look like the church published it. Visible banner: sample lessons, not from this church. Visitors see it too — label is mandatory. |
| **Give** (`/member/give`) | **[HIDE]** | Thank-you looks like money moved. There is no payment or ledger. CONVERT only when a provider exists. Until then, remove from member nav (and do not show a successful-gift state). |
| **Visitors CRM** (`/visitors`) | **[CONVERT]** | `visitors` table and register API already exist; the staff page is the missing wire. CONVERT to session-church rows. **Interim:** **HIDE** from sidebar if CONVERT is not in the same release — staff must not phone `@ckc-sample.test` people. |
| **Ministries** (`/ministries`) | **[HIDE]** | No table, no API. Fake rosters (leaders, headcounts). CONVERT is a new feature, not a wire-up. Park in `docs/future-features-notes.md`. |
| **Pastoral care** (`/pastoral-care`) | **[HIDE]** | No backend. Fake hospital/counseling cases are worse than a missing menu. CONVERT later as a real care module. |
| **Reports** (`/reports`) | **[HIDE]** | Fake KPIs (342 members, conversion %). Pastors must not plan from sample charts. CONVERT when check-in + membership can feed aggregates. |
| **Dashboard** (`/dashboard`) | **[CONVERT]** stats; **[HIDE]** fake lists | Upcoming events are already live — keep. Stat cards (342 / 18 / 27) **CONVERT** to real counts (members, visitors table, open prayers, upcoming events). Hardcoded recent-visitors and prayer widgets **HIDE** until Visitors CRM is converted and prayer inbox is the source. Do not PREVIEW fake names in ops. |

Member announcements **demo fallback** (B8): **[PREVIEW]** — if the DB is empty, label sample posts or show empty state; do not imply the campus published “This Sunday”.

Church info generic social URLs: parkable copy, not CONVERT/HIDE/PREVIEW of a module.

---

## 6. Order of execution

| Step | Area | Why |
| --- | --- | --- |
| 0 | Safety | Staging ref, port 4030, live untouched |
| 1 | **Q smoke** (Q6 on a few GETs, Q11) | If 404 guards are broken, stop |
| 2 | **A Auth** | Everything else needs sessions |
| 3 | **H Membership** | Approve/reject/suspend; suite emails only |
| 4 | **C Events/check-in** | Highest recent bug density |
| 5 | **Q full** (Q1–Q13) | Ticket + visitor register are the weak filters |
| 6 | **D, F, E** | Content + prayer tenant titles |
| 7 | **G Groups** | Needs members |
| 8 | **I, J preview** | Outbound last; preview before send |
| 9 | **B** Member home | Needs sermons/events/announcements |
| 10 | **L, M, N, O, P, K** | Confirm mock vs live; record §5 gaps |
| 11 | Delete suite | `suite-delete.cjs`; `@suite-test.example` count 0; Hope/Cornerstone churches gone; `ckc` / `grace-test` churches remain |

Do not broadcast/follow-up **send** until J1/I1 counts are fixture-only.

---

## 7. Stop conditions

### Halt the whole pass (blocker)

Do not continue to later areas, do not talk about deploy, fix on staging first:

- **Auth broken** — cannot log in, wrong church session, suspend ignored, invite creates the wrong `church_id`
- **Cross-tenant leak** — any Q test where Church B data appears for Church A (or ticket/visitor Q12–Q13 overwrite/leak)
- **Data corruption** — delete/approve/reject/check-in mutates another church, seed `98129477-…`, or live (live must never be in the URL)
- **Mock shown as real in a live-facing view** — unlabelled Daily Word as “this week’s lesson”, Give thank-you as a completed tithe, Dashboard/Visitors/Reports numbers as if they were this church’s ops. After §5, shipping those screens without HIDE/PREVIEW/CONVERT is the same blocker
- **Fixture safety failure** — create/delete pointing at live, or delete removing non-suite rows

### Park (notes file, do not halt)

Write in `docs/future-features-notes.md` (or a suite findings list) and keep going:

- Missing copy, empty states, spacing, wrong church name on a not-found shell
- Rejection email not sent (H3) — already a known gap
- Membership expiry job not running (H9)
- Teen accounts, room settings, RLS, platform admin — already parked
- Ministries / pastoral / reports **after** they are HIDDEN — absence is expected
- I4 SMS skipped to avoid billing
- Cosmetic staff disambiguator formatting
- Demo announcement fallback once labelled PREVIEW
- Features explicitly not-yet-built in the inventory

### After a blocker

Fix the cause, reset suite check-ins or re-create if data is dirty, restart from the failed area (from step 1 if the leak is tenant-wide). Do not push. Do not touch live.
