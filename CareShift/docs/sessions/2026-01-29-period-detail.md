# Session: Period Detail page

## Intent: User can open a period detail page (`/periods/:id`) from the periods list.

## What works:

-Navigation from /periods to /periods:/id
-Period data rendered on detail page
-Invalid ids show scoped 404 error page with recovery link

## Compromises:

-Detail page fetches all periods and filters by id
-No /periods/:id backend endpoint yet

## Out of scope

-slot rendering / editing
-Publishing / permission
-Error Telemetry

## Next intent

Admin can view slots belonging to a period (read-only).
