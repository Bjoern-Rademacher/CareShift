import { cookies } from "next/headers";

import { CurrentUser } from "@/types/auth";

const COOKIE_NAME = "sp_dev_session";

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<CurrentUser>;

    if (typeof parsed.userId !== "string" || parsed.userId.length === 0) {
      return null;
    }

    if (
      parsed.role !== "admin" &&
      parsed.role !== "employee" &&
      parsed.role !== "viewer"
    ) {
      return null;
    }

    return parsed as CurrentUser;
  } catch {
    return null;
  }
}
