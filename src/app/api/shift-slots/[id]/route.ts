import type { UUID } from "@/types/common";
import { getCurrentUser } from "@/auth/currentUser";
import { NextResponse } from "next/server";
import { METHOD_NOT_ALLOWED } from "@/app/api/_shared/responses";
import {
  assignEmployeeToShiftSlot,
  unassignEmployeeFromShiftSlot,
} from "@/lib/db/shiftSlots";

type RouteParams = { id: UUID };

type AssignBody =
  | {
      action: "assign";
      employeeId: UUID;
    }
  | {
      action: "unassign";
    };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isAssignBody(body: unknown): body is AssignBody {
  if (typeof body !== "object" || body === null) return false;

  const record = body as Record<string, unknown>;

  if (record.action === "assign") {
    return isNonEmptyString(record.employeeId);
  }

  if (record.action === "unassign") {
    return true;
  }

  return false;
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
    return NextResponse.json({ error: "Missing slot id" }, { status: 400 });
  }

  const parsed = await parseJson(request);

  if (!parsed.ok) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isAssignBody(parsed.body)) {
    return NextResponse.json(
      { error: "Invalid assign action" },
      { status: 400 },
    );
  }

  try {
    const slot =
      parsed.body.action === "assign"
        ? await assignEmployeeToShiftSlot(slotId, parsed.body.employeeId)
        : await unassignEmployeeFromShiftSlot(slotId);

    return NextResponse.json(
      {
        ok: true,
        assigned: {
          slotId: slot.id,
          employeeId: slot.employeeId,
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Shift slot update failed" },
      { status: 400 },
    );
  }
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
