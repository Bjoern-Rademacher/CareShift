import type { UUID } from "@/types/common";
import { getCurrentUser } from "@/auth/currentUser";
import { NextResponse } from "next/server";
import { mockStore } from "@/lib/mock/store";

type RouteParams = { id: UUID };

type AssignBody = { employeeId: UUID };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isAssignBody(body: unknown): body is AssignBody {
  if (typeof body !== "object" || body === null) return false;
  if (!("employeeId" in body)) return false;

  const employeeId = (body as Record<string, unknown>).employeeId;
  return isNonEmptyString(employeeId);
}

async function parseJson(
  request: Request,
): Promise<{ ok: true; body: unknown } | { ok: false }> {
  try {
    const body = await request.json();
    return { ok: true, body };
  } catch {
    return { ok: false };
  }
}

const METHOD_NOT_ALLOWED = Response.json(
  { error: "Method not allowed" },
  { status: 405 },
);

export async function PATCH(
  request: Request,
  context: { params: Promise<RouteParams> },
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (currentUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const slotId = (await context.params).id;

  if (!isNonEmptyString(slotId)) {
    return Response.json({ error: "Missing slot id" }, { status: 400 });
  }

  const parsed = await parseJson(request);
  if (!parsed.ok) {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isAssignBody(parsed.body)) {
    return Response.json({ error: "Missing employeeId" }, { status: 400 });
  }

  const { employeeId } = parsed.body;
  const slot = mockStore.shiftSlots.find((s) => s.id === slotId);

  if (!slot) {
    return Response.json(
      { ok: false, error: "Shift slot not found" },
      { status: 404 },
    );
  }

  slot.employeeId = employeeId;

  return Response.json(
    {
      ok: true,
      assigned: {
        slotId: slot.id,
        employeeId: slot.employeeId,
      },
    },
    { status: 200 },
  );
}

export function GET() {
  return METHOD_NOT_ALLOWED;
}
export function POST() {
  return METHOD_NOT_ALLOWED;
}
export function DELETE() {
  return METHOD_NOT_ALLOWED;
}
