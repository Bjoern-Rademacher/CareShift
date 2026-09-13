"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE } from "./constants";

import { isValidRole } from "@/types/auth";

export async function login(formData: FormData) {
  const userKey = formData.get("role");

  if (!isValidRole(userKey)) {
    throw new Error("Invalid login user");
  }
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, userKey, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect("/dashboard");
}
