# Staging platform suite fixture

Load-test data for the feature-completeness pass. Staging only. Never run against live.

## Safety

Both scripts exit unless `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` contains `qtbvagdjgleihyoajkgw`. They refuse the live project ref `lmtxevkbrrpnvuzhbetl`.

- Emails must end in `@suite-test.example`
- Phones must start with `+278200088`
- Password for every login: `SuiteTest2026`
- Create refuses if `scripts/suite-ids.json` already exists, or if any suite email is already on staging
- Delete uses **only** ids in the manifest
- Never deletes churches `ckc` or `grace-test`
- Never deletes seed event `98129477-63eb-410d-bbb7-7af8dab2dfda`
- Manifest is written **only after every insert batch succeeds**. A failed batch rolls back in-memory ids and does not write the manifest

## Run (after you approve)

Create:

```bash
node --env-file=.env.staging scripts/suite-create.cjs
```

Delete:

```bash
node --env-file=.env.staging scripts/suite-delete.cjs
```

`scripts/suite-ids.json` is gitignored. Scripts are not.

## Scale

Four churches:

| Church | `church_id` | Slug | Origin |
| --- | --- | --- | --- |
| CKC | `ckc` | `ckc-midrand` | Existing — suite rows only |
| Grace Test | `grace-test` | `grace-test` | Existing — suite rows only |
| Hope Assembly | `hope-assembly` | `hope-assembly` | Created by suite, removed on delete |
| Cornerstone | `cornerstone` | `cornerstone` | Created by suite, removed on delete |

Per church:

- **50** adult members (household mix below). Kids are dependants on `application_data` only
- **4** staff: `senior_pastor` (church_admin), `admin` (campus_admin, Midrand), `pastor` (Verulam), `administrative_manager`
- **1** of the 50 members has `role = leader` (not a fifth staff row)
- **1** of the 50 members is `suspended`
- **25** visitors (no profile / member)
- **6** ministry groups + **2** community groups
- **3** events (in-window, ended, future) + **1** RSVP with `ticket_code` on the in-window event
- **2** sermons, **2** announcements, **3** prayers (first confidential), **3** follow-ups

Kids: 6 couples with 3 kids + 3 couples bumped to 4 kids + other shapes ≈ **74 dependants** per church (50 adults unchanged).

## Household mix (50 adults)

| Shape | Households | Adults | Kids |
| --- | --- | --- | --- |
| 2 married, 0 kids | 6 | 12 | 0 |
| 2 married, 3 kids (first 3 households: 4 kids) | 9 | 18 | 27 + 3 |
| 1 single parent, 2 kids | 5 | 5 | 10 |
| 1 married adult, 4 kids (spouse not in app) | 5 | 5 | 20 |
| 1 widowed, 1 kid | 5 | 5 | 5 |
| 1 divorced, 3 kids | 3 | 3 | 9 |
| 1 elderly 70+, 0 kids | 2 | 2 | 0 |
| **Total** | **35** | **50** | **74** |

Married couples: kids on the wife's application only; IDs cross-linked for spouse-fallback check-in.

## Generator

`mulberry32` seeded with `suite-v1` + `church_id`. Same seed → same names, emails, phones, and row UUIDs.

Event **start/end times** use the clock so the in-window event is actually in window when you create.

Phones: `+278200088` + 4-digit serial. Bases: CKC `0000`, Grace `1000`, Hope `2000`, Cornerstone `3000`.

Emails: `{given}.{surname}.{churchKey}.{seq}@suite-test.example`

## Ministries

No `ministries` table. Six `groups` rows per church, `category = 'ministry'`:

Men of Valor, Women of Destiny, Super Kids, Worship Ministry, Ushers and Protocol, Media.

Worship has `enable_song_library = true`. Staff `/ministries` stays mock and is marked **[HIDE]** in the feature-test plan. This data appears under **Groups**.

## Staff mapping

| Requested | Stored `profiles.role` |
| --- | --- |
| church_admin | `senior_pastor` |
| campus_admin | `admin` |
| pastor | `pastor` (Verulam) |
| administrative_manager | `administrative_manager` |

## One-shot

Not idempotent. Delete first, then create. No upsert.
