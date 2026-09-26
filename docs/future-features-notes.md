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
