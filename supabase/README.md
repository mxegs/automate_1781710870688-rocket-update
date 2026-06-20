# Supabase folder

**Start here:** [`SETUP.md`](./SETUP.md) — full setup, migrations, and test flow.

**After email-auth change:** [`CLEANUP.md`](./CLEANUP.md) — DB cleanup, env check, test checklist.

## Quick links

| File | Purpose |
|------|---------|
| `migrations/` | Run in order in SQL Editor |
| `check_migrations.sql` | ✓/✗ status for each migration |
| `cleanup_dummy_contacts.sql` | Remove fake/demo contacts + audit |
| `seed_broadcast_test_contacts.sql` | Optional real emails for Mailchimp test |

## Auth model (current)

- **Email (Resend):** sign-in links, invite links
- **SMS (BulkSMS):** broadcasts + admin alerts on new invite requests
- **Mailchimp:** email newsletters only

Phone numbers live on **member profiles** (membership form), not on login or request-invite.
