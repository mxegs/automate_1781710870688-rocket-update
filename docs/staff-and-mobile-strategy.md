
This keeps staff work focused and stops the team from trying to
make fifteen admin screens phone-friendly.

---

## What NOT to Do

- Do NOT build a fully responsive admin app now.
- Do NOT redesign every staff screen for mobile.
- Do NOT block mobile users from staff pages. Let them use
  what works and advise the laptop.
- Do NOT skip phone-friendliness on the two exceptions
  (`/events/[id]/checkins` and `/events/scan`).

---

## Future Work (not now)

Build a slim mobile staff view for a subset of features, later,
if a paying church asks for it. Candidates:

- Today's check-ins (already done)
- Member lookup by name
- Quick reply to a follow-up
- Approve or reject a membership application (name + photo +
  yes/no)

The full admin stays at `yourapp.com/dashboard` on a laptop.

Do this only if a real church demands it. Do not over-engineer
before there is demand.

---

## Duplicate-Name Disambiguation (related)

Staff lists must show at least two disambiguators per member
name: campus, age, or last 4 digits of phone. Churches commonly
have multiple people with the same name. Picking the wrong one
in a broadcast sends an SMS to the wrong person.

Full entry lives in `docs/future-features-notes.md` under
"Duplicate-name disambiguation in staff UI".

---

## Cross-Cutting Note for the Design Pass

Add to `docs/ui-redesign-todo.md`:

- Staff screens are laptop-first, with two phone-friendly
  exceptions: `/events/[id]/checkins` and `/events/scan`
- Consider a small "use a laptop for this" note on phone views
  of the other staff screens
- Staff lists must show two disambiguators per member name

---

## Summary

| Question | Answer |
|---|---|
| Primary device for staff work | Laptop |
| Phone-friendly staff screens | Check-in list, scanner |
| Other staff screens on phone | Render only, do not optimise |
| Advise the user? | Yes, via a small dismissible banner |
| Build a mobile staff app? | Later, only if a church demands it |
| Full responsive design? | Not now |

---

End of decision record.