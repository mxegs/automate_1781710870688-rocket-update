# Staging check-in fixture

Staging-only households and events for check-in tests. Never run against live.

## Safety

Both scripts exit unless `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` contains `qtbvagdjgleihyoajkgw`. They also refuse the live project ref. Emails must end in `@fixture-test.example`. Phones must start with `+278200099`.

## Run (after you approve)

Create:

```bash
node --env-file=.env.staging scripts/fixture-create.cjs
```

Writes `scripts/fixture-ids.json` (exact ids). If that file already exists, or any fixture email is already in staging, create refuses — delete first.

Delete:

```bash
node --env-file=.env.staging scripts/fixture-delete.cjs
```

Deletes only the ids in `fixture-ids.json`, plus check-ins on those events or those members. Prints every removed id. Then deletes `fixture-ids.json`.

Password for every fixture login: `FixtureTest2026`

Staff login (for `/events/[id]/checkins`): `staff-fixture@fixture-test.example` — profile `role = admin` (campus admin).

## What it creates (`church_id = ckc`)

### Households

1. **Mokena** (Midrand) — spouse-fallback  
   - Thabo `thabo-fixture@fixture-test.example` / `+27820009901` — kids **not** on his application  
   - Sarah `sarah-fixture@fixture-test.example` / `+27820009902` — Lerato (5), Thabo Jr (8)  
   - Thabo’s `guardian.identityNumber` is Sarah’s ID so `dependantsForMember` can fall back. The member panel still only reads the signed-in phone’s application.

2. **Dlamini** (Midrand) — single mom  
   - Nomsa `nomsa-fixture@fixture-test.example` / `+27820009903`  
   - Sipho (3, Preschool), Amahle (7, Kids), Kagiso (11, Tweens)

3. **Naidoo** (Midrand) — teen with no Teens room  
   - Priya `priya-fixture@fixture-test.example` / `+27820009904` — Aarav (14)  
   - Rajesh `rajesh-fixture@fixture-test.example` / `+27820009905` — no kids on his application  
   - Aarav’s room is null → staff list buckets him under **Adults**

4. **Khumalo** (Midrand) — adult only  
   - Bongani `bongani-fixture@fixture-test.example` / `+27820009906`

5. **Van Der Merwe** (Midrand)  
   - Anna `anna-fixture@fixture-test.example` / `+27820009907` — Wandi (2, Nursery), Pieter (6, Kids), Elsabe (10, Tweens)  
   - Johan `johan-fixture@fixture-test.example` / `+27820009908` — kids not on his application

6. **Molefe** (Verulam)  
   - Karabo `karabo-fixture@fixture-test.example` / `+27820009909`  
   - Tebogo (17) — dependant, room null; Midrand `campus_only` events are not this campus

7. **Staff** (Midrand) — campus admin, no kids  
   - Fundi `staff-fixture@fixture-test.example` / `+27820009910`  
   - `profiles.role = admin` so RouteGuard and the staff sidebar allow `/events/[id]/checkins`

### Events (Midrand, `campus_only`)

| Key | Title | Window |
| --- | --- | --- |
| A | CKC Sunday Service | starts now, ends +2 hours |
| B | CKC Service Ended | started 3 hours ago, ended 1 hour ago |

There may already be another “CKC Sunday Service” from the Grace/CKC seed. Use the id in `fixture-ids.json`, not the title.

## Using it in tests

- Member login: `/ckc-midrand/login` with a fixture email and `FixtureTest2026`.
- Staff check-ins: sign in as `staff-fixture@fixture-test.example`, then `/events/<in-window-id>/checkins`.
- Spouse-fallback API: check in as Thabo Mokena via `POST /api/events/checkins` (API uses `dependantsForMember`). Member UI as Thabo will not list kids until spouse-fallback is in the panel.
- Rooms: 2 Nursery, 3–5 Preschool, 6–8 Kids, 9–12 Tweens; 13–17 → no room.
- Cross-campus: Karabo should not see Midrand campus-only events.
- After tests: run `fixture-delete.cjs`. Do not leave fixture rows on staging longer than needed.
