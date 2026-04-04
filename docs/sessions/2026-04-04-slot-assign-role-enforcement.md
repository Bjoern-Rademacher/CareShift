Session: Role enforcement in slot assignment API

# Intent

Enforce admin-only access for slot assignment through the API.

# What works

PATCH /api/shift-slots/[id] now reads the current user from session cookie
Unauthenticated requests return 401 Unauthorized
Authenticated non-admin requests return 403 Forbidden
Admin requests still succeed as before
Authorization is enforced server-side, independent of UI

# Compromises

Role check is implemented inline in the route
Only the slot assignment endpoint is protected so far
UI still shows assignment controls to non-admin users

- Out of scope
  Generic permission helpers
  UI role gating / hiding admin controls
  Enforcement on other API endpoints

# Next intent

Hide admin-only controls in the UI and prevent non-admin users from opening the assignment flow.
