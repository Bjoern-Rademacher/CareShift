# Session: Periods Index – Department & Week Selection

## Intent

User can select a department and a week to view matching schedule periods.

## What works

- Department selector filters periods correctly
- Week picker snaps selected dates to Monday
- Prev / Next buttons navigate weeks in 7-day steps
- Period list updates based on department + week
- Clear empty state shown when no period exists for a selected week

## Compromises

- All periods are fetched and filtered client-side
- Week is identified by Monday date-only string (`YYYY-MM-DD`)
- No backend query parameters yet (`department`, `weekStart`)

## Out of scope

- Month or ISO week views
- Creating periods from empty state
- Slot rendering or editing
- Authentication / authorization
- Publishing or locking logic

## Notes

- Date handling intentionally normalized to avoid timezone issues
- Empty state is treated as a valid UX outcome, not an error

## Next intent

User can open a period detail page (`/periods/:id`) from the periods list.
