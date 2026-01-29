# Session: Period details shows shift slots

## Intent: User can view shift slots for a selected period (read-only)

## What works:

-Shift slots are rendered as a table on /periods/:id
-Only slots belonging to the selected period are shown.
-When no slots exist for a period, an empty state is displayed.

## Compromises:

-Authorization is not enforced yet; “Admin” is a future access boundary.
-Slots are fetched broadly and filtered by periodId instead of a scoped backend query.

## Out of scope

-Creating new shift slots
-Editing existing shift slots
-Assigning employees to shift slots
-Publishing or republishing a period

## Next intent

Admin can assign employees to shift slots.
