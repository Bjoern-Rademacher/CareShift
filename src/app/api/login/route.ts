import { cookies } from "next/headers";

import { mockStore } from "@/lib/mock/store";

const COOKIE_NAME = "sp_dev_session";

export async function POST(request: Request) {
  const body = await request.json();

  const user = mockStore.employees.find(
    (employee) =>
      employee.email === body.email &&
      employee.password === body.password &&
      employee.status === "ACTIVE",
  );

  if (!user) {
    return Response.json(
      {
        ok: false,
        error: "Invalid credentials",
      },
      { status: 200 },
    );
  }

  const sessionUser = {
    userId: user.id,
    role: user.accessPermission === "ADMIN" ? "admin" : "employee",
  };

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, JSON.stringify(sessionUser), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return Response.json(
    {
      ok: true,
      user: sessionUser,
    },
    { status: 200 },
  );
}
