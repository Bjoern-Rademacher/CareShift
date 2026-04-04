# Session: UI role gating for assignment

## Intent

Hide assignment controls from non-admin users.

## What works

- Admin still sees and uses assignment controls
- Employee and viewer no longer see assignment controls
- Assignment modal open handler is guarded client-side

## Compromises

- UI gating only applied to assignment flow so far
- No generic permission helpers yet

## Next intent

Add employee schedule view.
