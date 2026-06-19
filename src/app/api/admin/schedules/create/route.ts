import { generateScheduleFromTemplate } from "@/lib/useCases/createScheduleFromTemplate";
import { METHOD_NOT_ALLOWED } from "@/app/api/_shared/responses";

import { DEPARTMENTS } from "@/types/common";
import type { Departments } from "@/types/common";

type CreateScheduleRequest = {
  department: Departments;
  weekStartDate: string;
};

function isDepartment(value: unknown): value is Departments {
  return (
    typeof value === "string" && DEPARTMENTS.includes(value as Departments)
  );
}

function isCreateScheduleRequest(
  value: unknown,
): value is CreateScheduleRequest {
  if (!value || typeof value !== "object") {
    return false;
  }

  const body = value as Record<string, unknown>;

  return (
    isDepartment(body.department) && typeof body.weekStartDate === "string"
  );
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!isCreateScheduleRequest(body)) {
      return Response.json(
        {
          ok: false,
          error: "Department and week start date are required.",
        },
        { status: 400 },
      );
    }

    const result = await generateScheduleFromTemplate({
      department: body.department,
      weekStartDate: new Date(`${body.weekStartDate}T00:00:00Z`),
    });

    if (!result.ok) {
      return Response.json(result, { status: 409 });
    }

    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error("Failed to create schedule", error);

    return Response.json(
      {
        ok: false,
        error: "Failed to create schedule.",
      },
      { status: 500 },
    );
  }
}

export function GET() {
  return METHOD_NOT_ALLOWED();
}

export function PUT() {
  return METHOD_NOT_ALLOWED();
}

export function PATCH() {
  return METHOD_NOT_ALLOWED();
}

export function DELETE() {
  return METHOD_NOT_ALLOWED();
}
