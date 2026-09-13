import { cookies } from "next/headers";

import { SESSION_COOKIE } from "@/lib/auth/constants";
import { DEMO_USERS, type CurrentUser } from "@/types/auth";

import { isValidRole } from "@/types/auth";

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const userKey = cookieStore.get(SESSION_COOKIE)?.value;

  if (!isValidRole(userKey)) {
    return null;
  }

  return DEMO_USERS[userKey];
}
