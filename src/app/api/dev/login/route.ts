import { NextRequest, NextResponse } from "next/server";
import type { Role, CurrentUser } from "@/types/auth";

const COOKIE_NAME = "sp_dev_session";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const role = body?.role as Role | undefined;

  if (role !== "admin" && role !== "employee" && role !== "viewer") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  let user: CurrentUser;

  if (role === "admin") {
    user = { userId: "dev-admin", role: "admin" };
  } else if (role === "employee") {
    user = {
      userId: "dev-employee-1",
      role: "employee",
      employeeId: "e-1",
    };
  } else {
    user = {
      userId: "dev-viewer-1",
      role: "viewer",
      department: "ER",
    };
  }

  const res = NextResponse.json({ ok: true });

  res.cookies.set(COOKIE_NAME, JSON.stringify(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return res;
}
