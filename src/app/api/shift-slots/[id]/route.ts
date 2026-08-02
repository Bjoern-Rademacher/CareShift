// src/app/api/shift-slots/[id]/route.ts

import { METHOD_NOT_ALLOWED } from "@/app/api/_shared/responses";
import { assignEmployeeToShiftSlot } from "@/lib/useCases/assignEmployeeToShiftSlot";

import type { UUID } from "@/types/common";

type AssignShiftSlotRequest = {
  employeeId: UUID;
};

function isAssignShiftSlotRequest(
  value: unknown,
): value is AssignShiftSlotRequest {
  if (!value || typeof value !== "object") return false;

  const body = value as Record<string, unknown>;

  return typeof body.employeeId === "string";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();

    if (!isAssignShiftSlotRequest(body)) {
      return Response.json(
        {
          ok: false,
          error: "Employee id is required.",
        },
        { status: 400 },
      );
    }

    const result = await assignEmployeeToShiftSlot({
      slotId: id as UUID,
      employeeId: body.employeeId,
    });

    // Expected business-rule failure.
    if (!result.ok && "errors" in result) {
      return Response.json(result, { status: 409 });
    }

    // The requested employee or shift slot does not exist.
    if (!result.ok) {
      return Response.json(result, { status: 404 });
    }

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("Failed to assign employee to shift slot:", error);

    // Unexpected application, database, or runtime failure.
    return Response.json(
      {
        ok: false,
        error: "Failed to assign employee to shift slot.",
      },
      { status: 500 },
    );
  }
}

export function GET() {
  return METHOD_NOT_ALLOWED;
}

export function POST() {
  return METHOD_NOT_ALLOWED;
}

export function PUT() {
  return METHOD_NOT_ALLOWED;
}

export function DELETE() {
  return METHOD_NOT_ALLOWED;
}
