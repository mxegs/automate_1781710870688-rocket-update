# CKC — Post email-auth cleanup checklist

Use this after migrations **#11** and **#12** are applied.

## 1. Database (Supabase SQL Editor)

Run in order if not already done:

1. `migrations/20250625000000_email_auth_invites.sql`
2. `migrations/20250626000000_simplify_email_signup.sql`
3. `cleanup_dummy_contacts.sql` — removes fake phones/emails and audit what remains
4. `check_migrations.sql` — confirm all ✓ RUN

**Audit query** (after cleanup): only real people should appear in `profiles`, `members`, and `follow_ups`.

## 2. Environment (`.env`)

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Sign-in links + invite emails |
| `EMAIL_FROM` | Verified sender (church domain when ready) |
| `BULKSMS_BASIC_AUTH` | SMS broadcasts + admin alert when someone requests membership |
| `MAILCHIMP_*` | Email newsletters only |
| `SUPER_ADMIN_EMAIL` | Your login only — never in members/broadcast lists |

Remove if still present (no longer used):

- `DEVICE_TRUST_DAYS`
- `DEVICE_TRUST_SECRET`

## 3. Code cleanup (done in repo)

Removed legacy auth paths:

- Phone SMS OTP (`/api/auth/otp/*`)
- Email OTP codes (`/api/auth/email-otp/*`)
- Phone registration check (`/api/auth/check-phone`)
- Trusted device skip-login (`/api/auth/device/*`)
- Unused `OtpInput` component

**Current auth:**

- Login → email magic link (`/api/auth/magic-link/*`)
- Invite → email link → membership form
- Phone → collected on membership form for BulkSMS broadcasts

## 4. Manual test (15 min)

| # | Action |
|---|--------|
| 1 | `/request-invite` — name, surname, email, campus |
| 2 | Admin gets SMS alert; request shows in Members → Invite Requests |
| 3 | Approve → invite email sent |
| 4 | Open invite link → membership form (add cell number) |
| 5 | Admin approves application |
| 6 | `/login` → email → tap sign-in link |
| 7 | Broadcast page — SMS uses member cell numbers; Mailchimp uses emails |

## 5. Still on the backlog (not cleanup)

- Yoco payment webhook (paid tickets)
- Announcement / event reminder crons
- Resend + Mailchimp domain verification (deliverability)
- Regenerate `src/lib/supabase/types.ts` after schema changes

## 6. Optional later

- Drop `trusted_devices` table if you will never use device trust
- Remove `supabase/migrations/20250620000001_seed_demo_data.sql` demo phones from fresh installs
- Archive `supabase/README.md` — use `SETUP.md` as the single guide
