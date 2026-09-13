import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/authorization";

export async function GET() {
  const auth = await requireAuthenticatedUser();

  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json(auth.user);
}
