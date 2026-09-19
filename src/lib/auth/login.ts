"use server";

import { cookies } from "next/headers";

import { SESSION_COOKIE } from "@/lib/auth/constants";

import { isDemoAuthSubject } from "@/types/auth";

type LoginResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

export async function login(formData: FormData): Promise<LoginResult> {
  const authSubject = formData.get("authSubject");

  if (!isDemoAuthSubject(authSubject)) {
    return {
      ok: false,
      error: "Invalid demo role.",
    };
  }

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, authSubject, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return {
    ok: true,
  };
}
