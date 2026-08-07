import { getCurrentUser } from "@/auth/currentUser";

export async function requireAuthenticatedUser() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      {
        ok: false,
        error: "Unauthorized.",
      },
      { status: 401 },
    );
  }

  return null;
}

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      {
        ok: false,
        error: "Unauthorized.",
      },
      { status: 401 },
    );
  }

  if (user.role !== "admin") {
    return Response.json(
      {
        ok: false,
        error: "Forbidden.",
      },
      { status: 403 },
    );
  }

  return null;
}
