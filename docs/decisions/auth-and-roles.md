################################################

# 17 feb 2026

# Intent

- Introduce a server-readable dev authentication source (HTTP-only cookie) that exposes a CurrentUser for role-based authorization.

# Decision

- Dev auth implemented via HTTP-only cookie `sp_dev_session`
- `getCurrentUser()` derives CurrentUser from cookie
- Session exposed through `GET /api/auth/session`
- Dev login/logout routes control cookie
- Auth provider intentionally replaceable later

# Domain Context

- Roles:
  admin → full scheduling control
  employee → view own schedule
  viewer → read-only department schedule

- Authentication source separated from authorization rules
- API routes will enforce permissions based on role

# Session Boundaries

In scope:

- cookie-based dev login
- logout endpoint
- session endpoint
- currentUser utility

Out of scope:

- real authentication provider
- role enforcement in API endpoints
- UI role indicator

################################################

# 4 april 2026

# intent

- Add role enforcement in API endpoints and hide admin-only controls in the UI.

# Decision

- Authorization is enforced in API endpoints, not only in UI.
- PATCH /api/shift-slots/[id] requires an authenticated admin.
- Unauthenticated requests return 401.
- Authenticated non-admin requests return 403.

# Domain Context

- Assignment is an admin-only action.
- Employee and viewer roles are read-only roles in this workflow.
- UI visibility does not replace server-side authorization.

# Session Boundaries

In Scope

- admin check in slot assignment API route
- 401 / 403 responses

Out of scope:

- hiding admin controls in UI
- generic permission helper extraction
- role enforcement on other endpoints

################################################
