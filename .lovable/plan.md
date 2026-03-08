## Event Functionality Enhancement

Based on the reference screenshots and your existing codebase, here's the plan to upgrade both the admin and public event views.

### What we're building

**1. Redesigned Admin Event Creation (full page instead of dialog)**
Replace the small dialog with a dedicated create/edit page inspired by the screenshots:

- Large editable title field at top
- Start/End datetime pickers side by side with timezone display (GMT+1/+2 Stockholm)
- Hours in 24h format
- Location input with address field
- Pull in link to location form google maps
- Description textarea (expandable)
- Event Options section: Capacity (editable, default "Unlimited")  
When adding a : **Max Capacity -** Close registration when reaching the capacity. Only approved guests count towards it.​
- Enable Over-Capacity Waitlist 
- Status selector (Draft/Published/Closed) as a dropdown in the header area
- City selector in the header area
- Event type selector
- Full-width "Create Event" / "Save" button at bottom

**2. Redesigned Admin Events List**
Replace the table with a timeline-style card layout:

- Upcoming/Past toggle tabs at the top
- Events grouped by date, showing: date on the left, event card on the right
- Each card shows: time, title, location, guest count, "Manage Event" link
- Keep the "+ New Event" button (navigates to create page)

**3. Admin Event Detail/Edit page**
Extend the existing `EventDetailPage` with an editable header section:

- Inline-editable title, dates, location, description
- Keep the existing attendance/invite management below
- Add a "Copy public link" button for published events

**4. Public Event Page**
New route: `/events/:eventId` (public, within PublicLayout)

- Hero section with event title, date/time, location
- "About Event" section with full description
- Location section with address text
- RSVP only possible if registered at WOW - if email is not recognized - offer to sign up for WOW
- Make it possible to have a published event but not possible to RSVP - we will display a text saying - your invitation is in the email 
- section (if visitor arrives via RSVP link, show one-click RSVP)
- Calendar integration: Google Calendar, Outlook.com, iCal download buttons in a modal/popover
- Clean white background, WOW branding colors

### Technical Details

**New files:**

- `src/pages/admin/CreateEventPage.tsx` -- full-page event creation form
- `src/pages/PublicEventPage.tsx` -- public-facing event detail page

**Modified files:**

- `src/pages/admin/EventsPage.tsx` -- timeline card layout with Upcoming/Past tabs
- `src/pages/admin/EventDetailPage.tsx` -- add inline editing for event metadata
- `src/App.tsx` -- add routes for `/admin/events/new` and `/events/:eventId`
- `src/pages/RsvpPage.tsx` -- enhance with richer event display and calendar modal

**Database:** No schema changes needed. The existing `events` table already has all required fields (title, description, location, start/end datetime, capacity, status, event_type, city_id).

**Route structure:**

```text
/admin/events          -- list (timeline view)
/admin/events/new      -- create page
/admin/events/:id      -- detail + edit + attendance
/events/:eventId       -- public event page (new)
/rsvp/:eventId/:token  -- RSVP page (existing, enhanced)
```

**Key design decisions:**

- White background throughout, using existing WOW blue/pink accent colors
- Serif font for headings (already configured)
- Card-based event list instead of table for admin
- Public event page is accessible without auth (uses anon read on published events -- will need an RLS policy for anon SELECT on events where status = 'published')

**RLS addition needed:**

```sql
CREATE POLICY "Anon can read published events"
ON public.events FOR SELECT TO anon
USING (status = 'published');
```