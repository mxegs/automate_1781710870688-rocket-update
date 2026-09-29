Long-term vision — write this as a decision record.

Save as docs/platform-vision.md.

# Platform Vision

The app is a perfect glove. A church is a hand. When a new
church arrives, we slide the hand into the glove. It fits.
First time. No sewing, no re-cutting, no adjustments.

## The end state

When the app is complete:

- Every table exists, indexed, ready for any church.
- Every screen is designed and branded from the churches table.
- Every string is generic or from the church record.
- No code anywhere hardcodes CKC's name, colors, or logo.
- Adding a church = 1 row in churches + onboarding steps.
- No code changes needed per church.
- The app behaves identically for church A and church B.

## The reset step

When the app is complete and tested with fake churches:

1. Take a fresh live backup.
2. On live, delete every fake church and its cascading data.
3. Keep only churches row for CKC.
4. Live is now a blank, prepared slate.
5. When a real church is ready, add them as a new row.

## The proof

Before declaring the glove ready, test with 4 churches on
staging:

- CKC — established, multi-campus, lots of data
- Grace Test — simple, one campus
- Hope Assembly — different branding (blue), two campuses
- Cornerstone — empty, no events, tests empty states

If all 4 fit perfectly, the glove is proven.

## What "fits perfectly" means

- No page shows the wrong church's name or colors
- No data leaks between churches
- No feature requires per-church code
- No screen requires manual setup
- Adding a new church takes minutes, not days

Then stop. Do NOT modify any code. Just write the doc.