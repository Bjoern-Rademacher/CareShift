import { METHOD_NOT_ALLOWED } from "@/app/api/_shared/responses";

import { requireAdmin } from "@/lib/auth/authorization";

import { getAssignableEmployees } from "@/lib/db/employees";
import {
  getSchedulePeriodById,
  markSchedulePeriodValidated,
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
    const auth = await requireAdmin();

    if (!auth.ok) {
      return auth.response;
    }

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

    if (body.action === "VALIDATE") {
      if (period.status === "PUBLISHED") {
        return Response.json(
          {
            ok: false,
            error: "Schedule already published.",
          },
          { status: 409 },
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

      const validatedPeriod = await markSchedulePeriodValidated(id);

      return Response.json({
        ok: true,
        action: "VALIDATE",
        period: mapSchedulePeriodToSchedule(validatedPeriod),
      });
    }

    if (period.status === "DRAFT") {
      return Response.json(
        {
          ok: false,
          error: "Schedule must be validated before publishing.",
        },
        { status: 409 },
      );
    }

    if (period.status === "PUBLISHED") {
      return Response.json(
        {
          ok: false,
          error: "Schedule already published.",
        },
        { status: 409 },
      );
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
