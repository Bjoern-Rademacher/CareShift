import { METHOD_NOT_ALLOWED } from "@/app/api/_shared/responses";
import { getAssignableEmployees } from "@/lib/db/employees";
import {
  getSchedulePeriodById,
  publishSchedulePeriod,
} from "@/lib/db/schedulePeriods";
import { mapSchedulePeriodToSchedule } from "@/lib/db/mappers";
import { validateSchedule } from "@/lib/functions/validateSchedule";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const period = await getSchedulePeriodById(id);

  if (!period) {
    return Response.json(
      {
        ok: false,
        error: "Period not found",
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

  const publishedPeriod = await publishSchedulePeriod(id);

  return Response.json(
    {
      ok: true,
      period: mapSchedulePeriodToSchedule(publishedPeriod),
    },
    { status: 200 },
  );
}

export function GET() {
  return METHOD_NOT_ALLOWED;
}

export function PATCH() {
  return METHOD_NOT_ALLOWED;
}

export function PUT() {
  return METHOD_NOT_ALLOWED;
}

export function DELETE() {
  return METHOD_NOT_ALLOWED;
}
