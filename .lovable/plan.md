

## Plan: Event Invitations and Enhanced Attendance Tracking

### What exists today
- RSVP page with unique token links works
- Event detail page has basic check-in with arrived/late/no_show
- Walk-in dialog creates new people or finds existing by email
- `event_invites` table stores invites with `rsvp_token`

### What needs to be built

#### 1. Database: Add "Meddelat forhinder" attendance status
Your GSheet has 5 statuses. The current DB enum only has 3 (`arrived`, `late`, `no_show`). Add `excused` to match "Meddelat forhinder" (notified they can't come).

Migration: `ALTER TYPE attendance_status ADD VALUE 'excused';`

#### 2. Event Detail Page: "Invite Members" flow
Add a button to select and invite members to an event:
- Open a dialog showing members (filterable by city, searchable by name/email)
- Checkbox to select multiple members
- "Send Invites" creates `event_invites` rows with unique `rsvp_token` for each
- Show the generated RSVP link per person (for now, to copy/paste into Mailchimp or email manually)
- Later: trigger Mailchimp automation or direct email

#### 3. Enhanced Check-in List (matching your GSheet)
Redesign the attendance table to show ALL invited people (not just RSVP Yes):
- Color-coded status badges matching your GSheet colors (green = attended, yellow = late, orange = excused, red = no-show, blue = walk-in)
- Dropdown with all 4 statuses: Arrived, Late (kom sent), Excused (Meddelat forhinder), No-show
- Show RSVP response column alongside attendance
- Summary stats: Total invited, RSVP Yes/No, Attended (incl. late), Excused, No-show, Walk-ins

#### 4. Improved Walk-in: Two modes
**Mode A: Existing member** -- Search by name or email in the database, pick from results, mark as arrived.

**Mode B: New person** -- Enter email only (minimum). Mark attendance as arrived. After saving, the system flags them for a "Gå med i WOW" signup email. For now: store their email + mark a `pending_signup` flag, and show a note in the admin UI that they need to complete signup.

#### 5. RSVP link display
In the event detail, show a copyable RSVP link per invite so admins can share links via Mailchimp or other channels.

### Technical details

**Migration:**
- Add `excused` value to `attendance_status` enum
- Add `pending_signup` boolean to `people` table (default false) for walk-in new members who haven't completed full signup

**EventDetailPage.tsx changes:**
- Add "Invite Members" dialog with member search/select
- Redesign check-in table to show all invitees with color-coded statuses
- Enhance walk-in dialog: add email search with autocomplete for existing members
- Add "Copy RSVP link" button per invited person

**Files modified:**
- `src/pages/admin/EventDetailPage.tsx` (major rewrite)
- New migration SQL

