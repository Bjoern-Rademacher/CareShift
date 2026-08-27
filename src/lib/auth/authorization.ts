import { getCurrentUser } from "@/lib/auth/currentUser";

import type { CurrentUser } from "@/types/auth";

type AdminUser = Extract<CurrentUser, { role: "ADMIN" }>;
type EmployeeUser = Extract<CurrentUser, { role: "EMPLOYEE" }>;
type DisplayUser = Extract<CurrentUser, { role: "DISPLAY" }>;

type AuthorizationSuccess<User extends CurrentUser> = {
  ok: true;
  user: User;
};

type AuthorizationFailure = {
  ok: false;
  response: Response;
};

type AuthorizationResult<User extends CurrentUser> =
  | AuthorizationSuccess<User>
  | AuthorizationFailure;

function unauthenticated(): AuthorizationFailure {
  return {
    ok: false,

    response: Response.json(
      {
        ok: false,
        error: "Authentication required.",
      },
      { status: 401 },
    ),
  };
}

function forbidden(message: string): AuthorizationFailure {
  return {
    ok: false,

    response: Response.json(
      {
        ok: false,
        error: message,
      },
      { status: 403 },
    ),
  };
}

export async function requireAuthenticatedUser(): Promise<
  AuthorizationResult<CurrentUser>
> {
  const user = await getCurrentUser();

  if (!user) {
    return unauthenticated();
  }

  return {
    ok: true,
    user,
  };
}

export async function requireAdmin(): Promise<AuthorizationResult<AdminUser>> {
  const auth = await requireAuthenticatedUser();

  if (!auth.ok) {
    return auth;
  }

  if (auth.user.role !== "ADMIN") {
    return forbidden("Administrator access required.");
  }

  return {
    ok: true,
    user: auth.user,
  };
}

export async function requireEmployee(): Promise<
  AuthorizationResult<EmployeeUser>
> {
  const auth = await requireAuthenticatedUser();

  if (!auth.ok) {
    return auth;
  }

  if (auth.user.role !== "EMPLOYEE") {
    return forbidden("Employee access required.");
  }

  return {
    ok: true,
    user: auth.user,
  };
}

export async function requireDisplay(): Promise<
  AuthorizationResult<DisplayUser>
> {
  const auth = await requireAuthenticatedUser();

  if (!auth.ok) {
    return auth;
  }

  if (auth.user.role !== "DISPLAY") {
    return forbidden("Display access required.");
  }

  return {
    ok: true,
    user: auth.user,
  };
}
