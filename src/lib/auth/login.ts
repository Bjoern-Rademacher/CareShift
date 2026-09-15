"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE } from "./constants";

import { isDemoAuthSubject } from "@/types/auth";

export async function login(formData: FormData) {
  const authSubject = formData.get("authSubject");

  if (!isDemoAuthSubject(authSubject)) {
    throw new Error("Invalid login user");
  }
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, authSubject, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect("/dashboard");
}
