# Slice 1 — Auth scaffold and roles
1.1 Current user source (dev auth)

/dev/login switch (admin / employee / viewer)

Cookie-based role + identity (server-readable)

getCurrentUser() (server) returns { role, userId, employeeId?, department? }

1.2 Permission layer

Central permissions.ts (canAssign, canPublish, canViewDepartment, canViewOwn)

API routes enforce 401/403 (not UI-only)

1.3 UI role indicator

Header badge: “Admin / Employee / Viewer”

Optional: employee name / department

# Slice 2 — Period lifecycle and navigation
2.1 Period list

List periods with status: Draft / Published

Empty state

2.2 Period detail page framing

Header: date range, status badge

Basic layout consistency

2.3 Publish workflow

Admin can publish/unpublish

Published state is visible and changes UI behavior

# Slice 3 — Admin: create period and generate slots
3.1 Create Period UI

Form: name, start/end dates (or week selector)

Create button → navigates to new period

3.2 Slot generation minimal

Pick one simple model:

generate default shift slots for departments for each day

show result in slots table

3.3 Guardrails

Only admin can access create period

Basic validation errors

# Slice 4 — Admin: assignment workflow (the one you’re doing)
4.1 Assign/Reassign UI

Assign modal opens from table

Eligible employees filtered (department)

4.2 Saving + error UI

Buttons disabled while saving

Error banner inside modal

Close on success, stay open on error

4.3 API enforcement

Employee/viewer calling PATCH gets 403

(Even if UI hides the button)

# Slice 5 — Read-only views (Employee + Viewer)
5.1 Employee “My schedule”

/me/schedule shows only assigned slots for current employee

Published periods only

Empty state (“No shifts assigned”)

5.2 Viewer “Department schedule”

/display/[department] (or /departments/[dept]/schedule)

Published only

No controls, no modals

Clear period selector (or “current published period”)

5.3 Privacy choice (pick one)

show full names

show first name + initial

show employee code

# Slice 6 — Page-level robustness and polish (minimum professional)
6.1 Loading and error states

Skeleton/loading state for pages

Not found page for invalid period

“Failed to load” UI (not just console)

6.2 Consistent UI primitives

Buttons/inputs/modals/alerts consistent

No random Tailwind soup leaking everywhere

6.3 Accessibility basics

Modal traps click (you did)

Keyboard close optional (Escape)

Focus management optional (nice-to-have)

“UI Finished” definition (checkpoint)

You’re UI-finished when this exact story works end-to-end:

Login as Admin → create period → generate slots → assign staff → publish

Login as Employee → can view own published schedule, cannot edit

Login as Viewer → can view one department’s published schedule, cannot edit

Refresh doesn’t wipe the world (persistence exists at least for assignments + period status)
