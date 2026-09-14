import { parseJsonBody } from "@/app/api/_shared/requests";

import { requireAdmin } from "@/lib/auth/authorization";
import { assignEmployeeToShiftSlot } from "@/lib/useCases/assignEmployeeToShiftSlot";
import { isRecord } from "@/lib/validation/common";
import { isUUID } from "@/lib/validation/uuid";

import type {
  AssignEmployeeErrorCode,
  AssignEmployeeResponse,
} from "@/types/assignment";
import type { UUID } from "@/types/common";

type AssignShiftSlotRequest = {
  employeeId: UUID;
};

function parseAssignShiftSlotRequest(
  value: unknown,
): AssignShiftSlotRequest | null {
  if (!isRecord(value) || !isUUID(value.employeeId)) {
    return null;
  }

  return { employeeId: value.employeeId };
}

const errorStatuses = {
  SHIFT_SLOT_NOT_FOUND: 404,
  EMPLOYEE_NOT_FOUND: 404,
  ASSIGNMENT_NOT_ALLOWED: 409,
} satisfies Record<AssignEmployeeErrorCode, number>;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const auth = await requireAdmin();

    if (!auth.ok) {
      const response = {
        ok: false,
        error:
          auth.response.status === 401
            ? {
                code: "UNAUTHENTICATED",
                message: "Authentication required.",
              }
            : {
                code: "FORBIDDEN",
                message: "Administrator access required.",
              },
      } satisfies AssignEmployeeResponse;

      return Response.json(response, { status: auth.response.status });
    }

    const json = await parseJsonBody(request);

    if (!json.ok) {
      return json.response;
    }

    const { id } = await params;
    const input = parseAssignShiftSlotRequest(json.data);

    if (!isUUID(id) || !input) {
      const response = {
        ok: false,
        error: {
          code: "INVALID_INPUT",
          message: "Valid shift slot and employee ids are required.",
        },
      } satisfies AssignEmployeeResponse;

      return Response.json(response, { status: 400 });
    }

    const result = await assignEmployeeToShiftSlot({
      slotId: id,
      employeeId: input.employeeId,
    });

    if (!result.ok) {
      const response = {
        ok: false,
        error: {
          code: result.error.code,
          message: result.error.message,
          issues: result.error.issues,
        },
      } satisfies AssignEmployeeResponse;

      return Response.json(response, {
        status: errorStatuses[result.error.code],
      });
    }

    const response = {
      ok: true,
      data: result.data,
    } satisfies AssignEmployeeResponse;

    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error("Failed to assign employee to shift slot:", error);

    // Unexpected application, database, or runtime failure.
    const response = {
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to assign employee to shift slot.",
      },
    } satisfies AssignEmployeeResponse;

    return Response.json(response, { status: 500 });
  }
}
