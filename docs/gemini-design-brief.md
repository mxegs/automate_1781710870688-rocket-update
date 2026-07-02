# Christ Kingdom Citizens (CKC) — Gemini Design Brief

Use this document to design every screen in the CKC church app with a consistent look.  
**Brand:** Christ Kingdom Citizens · **Abbreviation:** CKC

---

## Global style guide (apply to every screen)

### Mood
Sophisticated, clean, premium faith community. Dark charcoal + muted gold + white. Not playful, not corporate-blue, not rainbow category colors.

### Colors
| Token | Hex | Use |
|--------|-----|-----|
| Gold accent | `#C5A073` | Dates, labels, first word of titles, icons, nav highlights |
| Gold button | `#D9B985` | Primary CTAs (Sign in, RSVP, Book seat, Submit) |
| Black | `#0A0A0A` | Text, logos, admin background |
| Card dark | `#1A1A1A` | Event rows, home grid tiles, admin cards |
| Block dark | `#1E1E1E` | Event info accordion blocks on detail page |
| White | `#FFFFFF` | Church Life backgrounds, button fills, header |
| Muted gray | `#666666` | Secondary text, captions |
| Page gray | `#E8E8E8` | Outer frame behind mobile column on desktop |
| Border light | `#E5E5E5` | Dividers on white screens |

### Typography
- **Body / UI:** DM Sans (clean sans-serif)
- **Event day numbers:** Playfair Display (serif, elegant)
- **Admin:** DM Sans bold, white on dark charcoal

### Two layout modes

**A — Church Life (member + visitor + public RSVP)**  
- Fixed mobile width ~430px, centered on desktop/tablet  
- White sticky header: `[hamburger]  CHRIST KINGDOM CITIZENS  [CKC circle logo]`  
- White content, light gray outer frame  
- Dark slide-out menu from left  
- Hero banners: grayscale photo + gold/white split title text  

**B — Admin / Staff**  
- Full responsive (laptop, tablet, phone)  
- Dark left sidebar + dark main content area  
- Gold accents on active nav, stats, primary buttons  
- Cards: charcoal `#1A1A1A`, subtle white/10 borders  

### Do not include
- Bright blue (#0EA5E9) accents  
- Rainbow category colors (keep gold/neutral only)  
- Sticky bottom bars on event detail (actions scroll with content)  

---

## Screen index

| # | Screen | Route | Mode |
|---|--------|-------|------|
| 1 | Login | `/login` | Auth |
| 2 | Login verify | `/login/verify` | Auth |
| 3 | Forgot password | `/forgot-password` | Auth |
| 4 | Reset password | `/reset-password` | Auth |
| 5 | Set password (account) | `/account/set-password` | Auth |
| 6 | Change password | `/account/change-password` | Auth |
| 7 | Request invite | `/request-invite` | Auth |
| 8 | Invite landing | `/invite/[token]` | Auth |
| 9 | Membership wizard | `/signup/complete` | Auth |
| 10 | Set password after signup | `/signup/set-password` | Auth |
| 11 | Signup success | `/signup/success` | Auth |
| 12 | Member home | `/member` | Church Life |
| 13 | Visitor home | `/visitor` | Church Life |
| 14 | Sermons & messages | `/member/sermons` | Church Life |
| 15 | Events list | `/member/events` | Church Life |
| 16 | Event detail | `/member/events/[id]` | Church Life |
| 17 | RSVP modal | (overlay on #16) | Church Life |
| 18 | Daily Word / Bible study | `/member/bible-study` | Church Life |
| 19 | Give | `/member/give` | Church Life |
| 20 | Submit prayer | `/member/prayer` | Church Life |
| 21 | Announcements (member) | `/member/announcements` | Church Life |
| 22 | Church info | `/member/church-info` | Church Life |
| 23 | Slide-out menu | (overlay) | Church Life |
| 24 | Public RSVP | `/rsvp/[eventId]` | Public |
| 25 | Dashboard | `/dashboard` | Admin |
| 26 | Members | `/members` | Admin |
| 27 | Visitors | `/visitors` | Admin |
| 28 | Follow-ups | `/follow-ups` | Admin |
| 29 | Events (admin) | `/events` | Admin |
| 30 | Admin event preview | `/events/[id]` | Admin |
| 31 | Ticket scan | `/events/scan` | Admin |
| 32 | Sermons (admin) | `/sermons` | Admin |
| 33 | Prayer requests (admin) | `/prayer-requests` | Admin |
| 34 | Ministries | `/ministries` | Admin |
| 35 | Groups | `/groups` | Admin |
| 36 | Broadcast | `/broadcast` | Admin |
| 37 | Pastoral care | `/pastoral-care` | Admin |
| 38 | Announcements (admin) | `/announcements` | Admin |
| 39 | Reports | `/reports` | Admin |
| 40 | Team & roles | `/team` | Admin |
| 41 | My groups (leader) | `/my-groups` | Admin |
| 42 | Group detail (leader) | `/my-groups/[id]` | Admin |

---

## Individual Gemini prompts

Copy one block at a time into Gemini. Replace `[brackets]` only if needed.

---

### Prompt 1 — Login
```
Design a mobile-first login screen for "Christ Kingdom Citizens" (CKC) church app.

ROUTE: /login
LAYOUT: Full-screen auth (no sidebar). Centered card on black #0A0A0A background with subtle gold radial glow at top.

STYLE: Gold accent #C5A073, gold button #D9B985, white text on dark. Font DM Sans. Premium, minimal.

COMPONENTS:
- CKC logo at top
- Heading: "Sign in"
- Email input field
- Password input field
- Gold gradient "Sign in" button
- Link: "Forgot password?"
- Link: "Request an invite"
- Optional toggle: password vs magic link
- Footer link for visitor mode

Do not add social login. No blue accents.
```

---

### Prompt 2 — Login verify
```
Design a confirmation screen for CKC church app after user requests a magic login link.

ROUTE: /login/verify
LAYOUT: Full-screen auth, black background, centered card.

COMPONENTS:
- CKC logo
- Mail/envelope icon in gold
- Heading: "Check your email"
- Body text: link sent to their inbox
- Subtext: check spam folder
- "Back to sign in" link

STYLE: Same auth palette — black, gold #C5A073, gold button #D9B985, DM Sans.
```

---

### Prompt 3 — Forgot password
```
Design forgot-password screen for CKC church app.

ROUTE: /forgot-password
LAYOUT: Auth shell, black background, centered card.

COMPONENTS:
- Back arrow to login
- Heading: "Forgot password"
- Email input
- Gold "Send reset link" button
- Success state: green/gold check + "Check your email"

STYLE: Black #0A0A0A, gold accents, DM Sans. No blue.
```

---

### Prompt 4 — Reset password
```
Design reset-password screen for CKC church app (user arrived from email link).

ROUTE: /reset-password
LAYOUT: Auth shell, centered card on black.

COMPONENTS:
- Heading: "Set new password"
- New password field
- Confirm password field
- Gold "Update password" button
- Success state with redirect message

STYLE: CKC auth palette — black, gold #C5A073, button #D9B985.
```

---

### Prompt 5 — Set password (account)
```
Design first-time password setup screen for CKC church app after email invite verification.

ROUTE: /account/set-password
LAYOUT: Auth shell, black background.

COMPONENTS:
- Welcome message with user email
- New password + confirm fields
- Gold "Save password" button
- Password requirements hint (8+ characters)

STYLE: Premium dark auth, gold accents only.
```

---

### Prompt 6 — Change password
```
Design change-password screen for logged-in CKC members/staff.

ROUTE: /account/change-password
LAYOUT: Can use Church Life mobile shell OR simple centered form on white.

COMPONENTS:
- Heading: "Change password"
- Current password
- New password
- Confirm new password
- Gold submit button
- Success confirmation

STYLE: White background if in Church Life shell; gold #D9B985 buttons.
```

---

### Prompt 7 — Request invite
```
Design "Request an invite" screen for people who want to join CKC church but have no invite link.

ROUTE: /request-invite
LAYOUT: Auth shell, black background, scrollable form card.

COMPONENTS:
- Heading: "Request membership invite"
- Fields: Full name, Email, Phone, Campus (dropdown), Optional message
- Gold "Submit request" button
- Success: "We'll be in touch" confirmation

STYLE: Dark auth, gold accents, DM Sans.
```

---

### Prompt 8 — Invite landing
```
Design invite welcome screen when someone opens their personal invite link.

ROUTE: /invite/[token]
LAYOUT: Auth shell, black background, centered card.

COMPONENTS:
- CKC logo
- Heading: "You're invited"
- Text showing campus name and church name
- Invitee email (read-only)
- Large gold "Continue to membership form" button
- Error state: "Invalid or used link"

STYLE: Warm, welcoming but premium. Gold on black.
```

---

### Prompt 9 — Membership application wizard
```
Design step 1 of 6 for CKC membership application wizard (mobile).

ROUTE: /signup/complete
LAYOUT: Dark auth shell, step indicator at top (1 of 6), scrollable form.

STEP 1 — Personal Information:
- Step dots or progress bar (gold active step)
- Fields: Title, First name, Surname, Preferred name, Gender, DOB, Email, Phone, Campus, Address, Occupation
- "Next" gold button at bottom

Show only step 1 in this mockup. Style: dark card #1A1A1A on black, gold labels, white inputs, DM Sans.

Additional steps (for reference, do not all show on one screen):
2 Guardian/Spouse/Family
3 Emergency contact
4 Spiritual information
5 Ministry & gifts
6 Review + covenant scroll + signature pad
```

---

### Prompt 10 — Membership wizard (Review + signature)
```
Design step 6 of 6 — Review & Covenant — for CKC membership application.

ROUTE: /signup/complete (final step)
LAYOUT: Dark auth, step indicator showing 6/6.

COMPONENTS:
- Collapsible review sections: Personal, Family, Emergency, Spiritual, Ministry
- Scrollable covenant text box (must scroll to bottom)
- Signature pad area (draw signature with finger)
- Checkbox: "I agree to the membership covenant"
- Gold "Submit application" button

STYLE: Dark #1A1A1A card, gold section headers, premium church feel.
```

---

### Prompt 11 — Set password after signup
```
Design post-application password creation screen for CKC.

ROUTE: /signup/set-password
LAYOUT: Auth shell, black background.

COMPONENTS:
- "Your application was approved" or welcome message
- Create password + confirm
- Gold "Create account" button

STYLE: Auth dark + gold.
```

---

### Prompt 12 — Signup success
```
Design application-submitted success screen for CKC church app.

ROUTE: /signup/success
LAYOUT: Auth shell, centered content.

COMPONENTS:
- Gold checkmark icon
- Heading: "Application submitted"
- Body: admin will review, you'll receive email when approved
- "Return to sign in" link

STYLE: Black background, gold accents, calm and reassuring.
```

---

### Prompt 13 — Member home
```
Design the member home screen for Christ Kingdom Citizens church app.

ROUTE: /member
LAYOUT: Church Life mobile 430px, white background, sticky white header with hamburger | CHRIST KINGDOM CITIZENS | CKC circle logo.

COMPONENTS (top to bottom):
1. Hero banner: grayscale worship photo, centered text "Latest" in gold #C5A073 + "Messages" in white
2. 2x2 grid of dark tiles #1A1A1A with rounded corners:
   - Daily Word (book icon, "Daily" gold + "Word" white)
   - Events (calendar icon, white text)
   - Give (heart icon, gold text)
   - Prayer (play/circle icon, white text)
3. Optional strip: "Now playing" latest sermon title
4. Footer: "Get Involved" with gold horizontal lines, row of 4 social icons (Facebook, Instagram, YouTube, TikTok)

Outer frame on desktop: light gray #E8E8E8. Font DM Sans. Premium, not cluttered.
```

---

### Prompt 14 — Visitor home
```
Design visitor home screen for CKC church app — same Church Life mobile layout as member home.

ROUTE: /visitor
LAYOUT: 430px mobile column, white header (hamburger | CHRIST KINGDOM CITIZENS | CKC logo).

COMPONENTS:
- Small gold badge: "Visitor Access"
- Same "Latest Messages" hero banner as member home
- 2x2 grid: Daily Word, Events, Sermons, Church Info (dark tiles #1A1A1A)
- Get Involved footer with social icons

No Give or Prayer tiles. Same gold/charcoal/white palette.
```

---

### Prompt 15 — Sermons & messages
```
Design sermons library screen for CKC Church Life app.

ROUTE: /member/sermons
LAYOUT: Church Life mobile shell, white content area.

COMPONENTS:
- Page title: "Sermons & Messages"
- Search bar
- Filter row: Type, Preacher, Year, Month, Category (dropdown chips)
- Grid of sermon cards: YouTube thumbnail, title, preacher, date, duration badge
- Grid/List view toggle
- Tap card opens video player modal (show one card selected with play overlay)

STYLE: White bg, dark sermon cards or light cards with gold accents. Thumbnail 16:9.
```

---

### Prompt 16 — Events list
```
Design upcoming events list for CKC Church Life app — match provided mockup closely.

ROUTE: /member/events
LAYOUT: Church Life 430px, white background.

COMPONENTS:
1. Hero: grayscale stage photo, white text "Upcoming Events"
2. Month sections: "January", "February" etc. with thin gray divider under heading
3. Event rows (dark card #1A1A1A, rounded):
   - LEFT: large gold serif day "23", white month "APR" below, vertical divider
   - CENTER: title split — first word gold ("Womens"), rest white bold ("Conference 2026")
   - RIGHT: white rectangular button "Details" black text

Repeat 3-4 sample events across two months. Page bg off-white/gray behind cards.
```

---

### Prompt 17 — Event detail
```
Design single event detail screen for CKC Church Life app.

ROUTE: /member/events/[id]
LAYOUT: Church Life mobile, white card on light gray page. NOT sticky footer.

COMPONENTS:
- "← Back to events" gray link
- Full-width poster image 16:9, rounded top corners
- Large black title: "Title of the Event"
- Three stacked dark blocks #1E1E1E rounded, white text labels:
  - Event info
  - Venue & Location
  - Important Info
- Price line: "Free" or "R2300" in large black text
- Thin gray divider
- Bottom action row (scrolls with page):
  - Wide gold button #D9B985: "Book your Seat" (or "Continue Booking" if paid)
  - Small white square button with settings/slider icon
  - Small white square button with share icon

White card border #E5E5E5. Premium, clean.
```

---

### Prompt 18 — RSVP modal
```
Design RSVP overlay modal for CKC event detail screen.

CONTEXT: Opens on top of event detail when user taps "Book your Seat".

COMPONENTS:
- White modal, rounded corners, dim black backdrop
- Header: "RSVP" + close X
- Fields: Full name, Phone, Email, Number of guests
- Gold "Confirm RSVP" button
- Alternate state: "Visitor sign-up" with gender, marital status, etc. (first-time visitors)

STYLE: White modal, black text, gold button. Mobile 430px width.
```

---

### Prompt 19 — Daily Word / Bible study
```
Design Bible study / Daily Word screen for CKC Church Life app.

ROUTE: /member/bible-study
LAYOUT: Church Life mobile, white background.

COMPONENTS:
- Series header: "Foundations of Faith" with gold accent
- Current week highlight card
- List of lesson cards (expandable):
  - Week number, title, scripture reference, date, leader name
  - Expanded: summary paragraph, bullet key points, "Watch video" link
  - Completed checkmark state on past lessons

STYLE: Light cards on white, gold accents for series title and active lesson.
```

---

### Prompt 20 — Give
```
Design online giving screen for CKC Church Life app.

ROUTE: /member/give
LAYOUT: Church Life mobile, white background.

COMPONENTS:
- Heading: "Give Online" with heart/gift icon in gold
- Subheading about tithes, offerings, building fund
- Giving type selector: Tithe | Offering | Building Fund | Missions (pills or cards)
- Amount field with "R" prefix
- Name + reference/note fields
- Bank details card (account name, bank, account number) — read-only info box
- Gold "Submit" button
- Success state: thank you + reference number

STYLE: Clean white form, gold CTAs, dark info card for banking details.
```

---

### Prompt 21 — Submit prayer
```
Design prayer request submission screen for CKC Church Life app.

ROUTE: /member/prayer
LAYOUT: Church Life mobile, white background.

COMPONENTS:
- Heading: "Submit a Prayer Request"
- Category dropdown: Health, Family, Finances, Salvation, Other
- Title field
- Description textarea
- "Keep confidential" checkbox
- Phone and email (pre-filled)
- Gold "Submit request" button
- Success card: gold check, auto-reply message from prayer team

STYLE: Calm, pastoral. White form, gold accents.
```

---

### Prompt 22 — Announcements (member)
```
Design member announcements feed for CKC Church Life app.

ROUTE: /member/announcements
LAYOUT: Church Life mobile, white background.

COMPONENTS:
- Page title: "Announcements"
- Search bar
- List of announcement cards:
  - Gold category/date line
  - Bold title
  - 2-line excerpt
  - Campus tag if church-wide vs campus-only

STYLE: Light cards with subtle border #E5E5E5, gold date accents.
```

---

### Prompt 23 — Church info
```
Design church information screen for CKC Church Life app.

ROUTE: /member/church-info
LAYOUT: Church Life mobile, white background, scrollable.

COMPONENTS:
- Hero: church name, tagline, founded year
- Pastor name + photo placeholder
- Service times card
- About / Vision / Mission sections (expandable or stacked)
- Values grid (4 items: Word-Centred, Spirit-Led, Community, Mission) with icons
- Campus cards: Midrand etc. with address, map link, phone
- Social media link row
- Contact email + phone

STYLE: Premium church profile page. Gold section headers, white/light gray cards.
```

---

### Prompt 24 — Slide-out navigation menu
```
Design slide-out navigation drawer for CKC Church Life app.

CONTEXT: Opens from hamburger icon on any Church Life screen.

LAYOUT: Dark drawer #0A0A0A from left, ~280px wide, over dimmed content.

COMPONENTS:
- Top: user display name, "Member Portal" or "Visitor Access" in gold
- Close X button
- Nav items with gold icons:
  Home, Sermons & Messages, Events, Daily Word, Give, Prayer, Announcements, Church Info
- Divider
- Staff only: "Leadership Desk" toggle button (gold border)
- Change password link
- Sign out link (muted, rose on hover)

STYLE: Dark menu, white text, gold active/hover state.
```

---

### Prompt 25 — Public RSVP (shareable link)
```
Design public event RSVP page for CKC — no login required, shareable link.

ROUTE: /rsvp/[eventId]
LAYOUT: Church Life 430px mobile column. Logo header only (no hamburger).

COMPONENTS:
- CKC logo centered at top
- "← Church app home" link
- Same event detail card as member event detail:
  - Poster, title, dark info blocks, Free/price, Book your Seat + icon buttons
- Visitor sign-up form before RSVP if first visit

STYLE: Identical to event detail #17 but public-facing header with logo.
```

---

### Prompt 26 — Admin dashboard
```
Design admin dashboard for CKC church management app.

ROUTE: /dashboard
LAYOUT: Admin mode — dark sidebar left + dark main area. Full responsive width.

SIDEBAR: Logo, nav items (Dashboard, Members, Events, Sermons…), user footer, gold active state.

MAIN CONTENT:
- Greeting: "Good morning, [Name]" (no emoji)
- Subtitle: "Here's what's happening at your church today"
- 4 stat cards in a row: Total Members, New Visitors, Active Prayer Requests, Upcoming Events (gold icons, white numbers)
- Two columns below:
  - Recent Visitors table
  - Prayer requests summary
- Upcoming events list

STYLE: Charcoal #1A1A1A cards on #0A0A0A background. Gold accents only. DM Sans.
```

---

### Prompt 27 — Members (admin)
```
Design members management screen for CKC admin app.

ROUTE: /members
LAYOUT: Admin dark sidebar + main content.

COMPONENTS:
- Page header: "Members" + gold "Send invite" button
- Search bar + campus filter dropdown
- Member table: Name, Phone, Email, Campus, Status (Active/Suspended/New), Ministry
- Row action menu: Edit, Suspend, Resend invite
- Tabs or sections: All members | Pending applications | Invite requests
- Pending application card: applicant name, date, Review button

STYLE: Dark admin table, gold header actions, status pills in gold tones.
```

---

### Prompt 28 — Visitors (admin)
```
Design visitor tracking screen for CKC admin app.

ROUTE: /visitors
LAYOUT: Admin dark layout.

COMPONENTS:
- Header: "Visitors" + "Add visitor" gold button
- Search + status filter pipeline: New Visitor → Contacted → Follow-Up → Attending → Membership Candidate → Became Member
- Visitor cards/table: name, phone, first visit date, source, status badge, notes preview
- Add visitor modal: name, phone, email, source, notes

STYLE: Dark admin, gold status badges, clean data table.
```

---

### Prompt 29 — Follow-ups (admin)
```
Design follow-ups task screen for CKC admin app.

ROUTE: /follow-ups
LAYOUT: Admin dark layout.

COMPONENTS:
- Header: "Follow-Ups"
- Filter: Due today | Overdue | Completed
- Task list rows: person name, type (call/visit), due date, assigned to, status
- Complete checkbox + notes field
- Empty state illustration

STYLE: Dark cards, gold due-date highlights for overdue items.
```

---

### Prompt 30 — Events admin list
```
Design admin events management list for CKC app.

ROUTE: /events
LAYOUT: Admin dark sidebar + main.

COMPONENTS:
- Header: "Events" + "Scan tickets" link + gold "Create Event" button
- Campus filter pills: All | Midrand | ...
- Month-grouped event list (same dark row style as member app BUT):
  - Right button says "More" (not Details)
  - Dropdown from More: Edit | RSVPs | Details | Delete
- Show one row with More menu open

Modals (show as separate small wireframes or note):
- Create/Edit event form (large modal)
- RSVP list modal with visitor/member sections

STYLE: Member event row aesthetic on dark admin page background.
```

---

### Prompt 31 — Create / Edit event form (modal)
```
Design create/edit event modal for CKC admin.

CONTEXT: Opens from Events admin "Create Event" or "Edit".

COMPONENTS (scrollable modal on dark backdrop):
- Title: "Create Event" or "Edit Event"
- Sections with gold headers:
  - Basics: title, image upload + preview, campus, visibility, category, start/end datetime, capacity
  - Event Info: description textarea
  - Venue: name, address, city, maps link
  - Important Info textarea
  - Ticketing: paid toggle, price, Yoco payment link
- Footer buttons: Cancel | Delete (edit only, red) | Save gold button

STYLE: Dark modal #1A1A1A, white text inputs, gold save button.
```

---

### Prompt 32 — Admin event preview
```
Design admin preview of event as members see it.

ROUTE: /events/[id]
LAYOUT: Admin sidebar visible + centered mobile-width event detail preview (same as member event detail #17) inside admin content area.

Shows staff how the event will look to members. Label: "Event preview".
```

---

### Prompt 33 — Ticket scan
```
Design event ticket scanning screen for CKC admin on event day.

ROUTE: /events/scan
LAYOUT: Admin layout, simple focused content.

COMPONENTS:
- Heading: "Scan Tickets"
- Large text input: "Enter or scan ticket code"
- Gold "Verify" button
- Result banner: green/gold success "✓ Name — checked in" OR red invalid
- Recent scans list (last 5)

STYLE: Dark admin, large touch-friendly input for door volunteers.
```

---

### Prompt 34 — Sermons admin
```
Design sermon/media management screen for CKC admin.

ROUTE: /sermons
LAYOUT: Admin dark layout.

COMPONENTS:
- Header: "Sermons & Media" + gold "Add sermon" button
- Filters: campus, type (Sermon/Audio/Book), visibility
- Grid of media cards with edit/delete
- Add/Edit modal: YouTube URL or ID, title, preacher, series, date, campus, visibility, category

STYLE: Dark admin grid, thumbnail previews, gold actions.
```

---

### Prompt 35 — Prayer requests admin
```
Design prayer request inbox for CKC admin/pastoral team.

ROUTE: /prayer-requests
LAYOUT: Admin dark layout.

COMPONENTS:
- Header: "Prayer Requests"
- Status tabs: New | Assigned | In Prayer | Answered
- Request cards: submitter name (or Confidential), category, title, description excerpt, date, campus
- Actions: Assign to team, Mark answered, Add note
- Detail slide-over or modal

STYLE: Dark cards, gold category tags, respectful tone.
```

---

### Prompt 36 — Ministries admin
```
Design ministries management screen for CKC admin.

ROUTE: /ministries
LAYOUT: Admin dark layout.

COMPONENTS:
- Header: "Ministries" + Add ministry
- Grid of ministry cards: name, leader, member count, campus, description excerpt
- Add/Edit modal: name, leader, description, meeting time

STYLE: Dark admin cards, gold icons.
```

---

### Prompt 37 — Groups admin
```
Design small groups management for CKC admin.

ROUTE: /groups
LAYOUT: Admin dark layout.

COMPONENTS:
- Header: "Groups" + Create group
- Table/cards: group name, campus, leader, meeting day/time, member count, status
- Create/Edit modal: name, campus, leader (dropdown), description, meeting schedule

STYLE: Dark admin, gold primary buttons.
```

---

### Prompt 38 — Broadcast
```
Design church broadcast composer for CKC admin.

ROUTE: /broadcast
LAYOUT: Admin dark layout.

COMPONENTS:
- Header: "Broadcast"
- Audience selector: All members | Specific group | Filters (campus, gender, age category)
- Channel toggle: SMS | Email
- Subject field (email only)
- Message textarea with character count (SMS)
- Preview: "Will reach X recipients"
- Gold "Send broadcast" button + test send link
- Result message after send

STYLE: Dark form, gold send button, clear audience summary card.
```

---

### Prompt 39 — Pastoral care
```
Design pastoral care records screen for CKC admin.

ROUTE: /pastoral-care
LAYOUT: Admin dark layout.

COMPONENTS:
- Header: "Pastoral Care" + Add record
- Search + type filter: Hospital visit, Counseling, Bereavement, Follow-up
- Records list: member name, type badge, date, pastor, notes excerpt
- Add record modal: member search, type, date, notes, follow-up date

STYLE: Dark admin, gold type badges, sensitive pastoral tone.
```

---

### Prompt 40 — Announcements admin
```
Design announcements management for CKC admin.

ROUTE: /announcements
LAYOUT: Admin dark layout.

COMPONENTS:
- Header: "Announcements" + Create announcement
- List: title, campus scope, publish date, status
- Create/Edit form: title, body (rich text), campus, visibility (church-wide / campus), publish date
- Delete confirmation

STYLE: Dark admin, gold create button.
```

---

### Prompt 41 — Reports
```
Design analytics/reports dashboard for CKC admin.

ROUTE: /reports
LAYOUT: Admin dark layout, wide content.

COMPONENTS:
- Header: "Reports"
- KPI row: members, visitors, conversion rate, attendance
- Charts (use gold color palette only, no blue):
  - Member growth line chart
  - Weekly attendance bar chart
  - Ministry breakdown pie chart
  - Prayer request status pie
  - Visitor conversion funnel

STYLE: Dark dashboard, gold chart colors (#C5A073, #D9B985, #8A7340, #D4BC94).
```

---

### Prompt 42 — Team & roles
```
Design team and roles management for CKC admin.

ROUTE: /team
LAYOUT: Admin dark layout.

COMPONENTS:
- Header: "Team & Roles" + Invite staff
- Staff table: name, email, role (Admin/Pastor/Leader/Senior Pastor), campus, actions
- Invite modal: email, display name, role, campus (if applicable)
- Role badges in gold tones
- Cannot edit super admin row

STYLE: Dark admin table, gold invite button.
```

---

### Prompt 43 — My groups (leader)
```
Design "My Groups" screen for group leaders in CKC app.

ROUTE: /my-groups
LAYOUT: Admin/leader layout (sidebar with limited nav).

COMPONENTS:
- Header: "My Groups"
- Cards for each group led: group name, campus, member count, last message date
- Tap card → group detail

STYLE: Dark cards, gold accents.
```

---

### Prompt 44 — Group detail (leader messaging)
```
Design group leader one-way messaging screen for CKC app.

ROUTE: /my-groups/[id]
LAYOUT: Admin layout.

COMPONENTS:
- Back link + group name as title
- Subtitle: "One-way messages — members cannot reply"
- Message history (sent messages with date/time)
- Compose area: message textarea + gold "Send to group" button
- Member count indicator

STYLE: Dark admin, simple messaging UI like admin announcement but scoped to one group.
```

---

## Quick reference: which mode per screen

| Mode | Screens |
|------|---------|
| **Auth (dark full-screen)** | 1–11 |
| **Church Life (mobile 430px)** | 12–24 |
| **Admin (dark sidebar)** | 25–44 |

---

## Tips for Gemini

1. Paste the **Global style guide** section first in a Gemini chat, then say "Remember this for all screens."
2. Paste **one prompt at a time** for best results.
3. Attach your existing mockup images when designing screens 13–17 (home, events list, event detail).
4. Ask Gemini to export **mobile 430×932** for Church Life and **1440×900** for admin screens.
5. Request **design tokens** output (colors, spacing, radius) after 3–4 screens to lock consistency.

---

*Generated for CKC app codebase — Christ Kingdom Citizens, Midrand.*
