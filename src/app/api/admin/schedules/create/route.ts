import { parseJsonBody } from "@/app/api/_shared/requests";

import { requireAdmin } from "@/lib/auth/authorization";
import { parseDateOnly } from "@/lib/functions/dateTimeUtils";
import { generateScheduleFromTemplate } from "@/lib/useCases/createScheduleFromTemplate";
import { isDepartment, isRecord } from "@/lib/validation/common";

import type { Departments } from "@/types/common";
import type { CreateScheduleResponse } from "@/types/scheduling";

type ParsedCreateScheduleRequest = {
  department: Departments;
  weekStartDate: Date;
};

function parseCreateScheduleRequest(
  value: unknown,
): ParsedCreateScheduleRequest | null {
  if (!isRecord(value)) {
    return null;
  }

  const weekStartDate = parseDateOnly(value.weekStartDate);

  if (!isDepartment(value.department) || !weekStartDate) {
    return null;
  }

  return {
    department: value.department,
    weekStartDate,
  };
}

export async function POST(request: Request): Promise<Response> {
  const auth = await requireAdmin();

  if (!auth.ok) {
    return auth.response;
  }

  const json = await parseJsonBody(request);

  if (!json.ok) {
    return json.response;
  }

  const input = parseCreateScheduleRequest(json.data);

  if (!input) {
    const response = {
      ok: false,
      error: {
        code: "INVALID_INPUT",
        message: "Department and a valid week start date are required.",
      },
    } satisfies CreateScheduleResponse;

    return Response.json(response, { status: 400 });
  }

  try {
    const result = await generateScheduleFromTemplate(input);

    if (!result.ok) {
      const response = {
        ok: false,
        error: {
          code: result.error.code,
          message: result.error.message,
          details: result.error.details,
        },
      } satisfies CreateScheduleResponse;

      return Response.json(response, { status: 409 });
    }

    const response = {
      ok: true,
      data: {
        schedule: {
          id: result.data.schedule.id,
        },
      },
    } satisfies CreateScheduleResponse;

    return Response.json(response, { status: 201 });
  } catch (error) {
    console.error("Failed to create schedule", error);

    const response = {
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to create schedule.",
      },
    } satisfies CreateScheduleResponse;

    return Response.json(response, { status: 500 });
  }
}
