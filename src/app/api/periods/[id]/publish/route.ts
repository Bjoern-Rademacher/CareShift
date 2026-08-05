import { METHOD_NOT_ALLOWED } from "@/app/api/_shared/responses";

import { getAssignableEmployees } from "@/lib/db/employees";
import {
  getSchedulePeriodById,
  publishSchedulePeriod,
} from "@/lib/db/schedulePeriods";

import { mapSchedulePeriodToSchedule } from "@/lib/mappers/scheduleMappers";
import { validateSchedule } from "@/lib/functions/validateSchedule";

type ScheduleAction = "VALIDATE" | "PUBLISH";

type ScheduleActionBody = {
  action: ScheduleAction;
};

function isScheduleActionBody(value: unknown): value is ScheduleActionBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "action" in value &&
    (value.action === "VALIDATE" || value.action === "PUBLISH")
  );
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const body: unknown = await request.json();

    if (!isScheduleActionBody(body)) {
      return Response.json(
        {
          ok: false,
          error: "Invalid schedule action.",
        },
        { status: 400 },
      );
    }

    const period = await getSchedulePeriodById(id);

    if (!period) {
      return Response.json(
        {
          ok: false,
          error: "Period not found.",
        },
        { status: 404 },
      );
    }

    const employees = await getAssignableEmployees();

    const validationErrors = validateSchedule(period.shiftSlots, employees);

    if (validationErrors.length > 0) {
      return Response.json(
        {
          ok: false,
          errors: validationErrors,
        },
        { status: 409 },
      );
    }

    if (body.action === "VALIDATE") {
      return Response.json({
        ok: true,
        action: "VALIDATE",
      });
    }

    const publishedPeriod = await publishSchedulePeriod(id);

    return Response.json({
      ok: true,
      action: "PUBLISH",
      period: mapSchedulePeriodToSchedule(publishedPeriod),
    });
  } catch (error) {
    console.error("Schedule action failed:", error);

    return Response.json(
      {
        ok: false,
        error: "Schedule action failed.",
      },
      { status: 500 },
    );
  }
}

export function GET() {
  return METHOD_NOT_ALLOWED();
}

export function PATCH() {
  return METHOD_NOT_ALLOWED();
}

export function PUT() {
  return METHOD_NOT_ALLOWED();
}

export function DELETE() {
  return METHOD_NOT_ALLOWED();
}
