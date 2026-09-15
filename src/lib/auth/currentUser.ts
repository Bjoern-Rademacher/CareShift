import "server-only";

import { cookies } from "next/headers";

import { SESSION_COOKIE } from "@/lib/auth/constants";

import { isDemoAuthSubject, type CurrentUser } from "@/types/auth";
import type { UUID } from "@/types/common";
import { getUserByAuthIdentity } from "@/lib/db/users";

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();

  const sessionCookieValue = cookieStore.get(SESSION_COOKIE)?.value;

  if (!isDemoAuthSubject(sessionCookieValue)) {
    return null;
  }

  const user = await getUserByAuthIdentity({
    authProvider: "DEV",
    authSubject: sessionCookieValue,
  });

  if (!user) {
    return null;
  }

  if (user.role === "DISPLAY") {
    return {
      role: "DISPLAY",
      firstName: "Display",
      lastName: "User",
    };
  }

  if (!user.employee) {
    throw new Error(`${user.role} user ${user.id} has no employee relation.`);
  }

  return {
    role: user.role,
    firstName: user.employee.firstName,
    lastName: user.employee.lastName,
    employeeId: user.employee.id as UUID,
  };
}
