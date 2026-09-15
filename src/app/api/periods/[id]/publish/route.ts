import { requireAdmin } from "@/lib/auth/authorization";

import { mapSchedulePeriodToSchedule } from "@/lib/mappers/scheduleMappers";

import { publishSchedulePeriod } from "@/lib/useCases/publishSchedulePeriod";

import type { UUID } from "@/types/common";
import type { PublishScheduleResponse } from "@/types/scheduling";

type RouteContext = {
  params: Promise<{
    id: UUID;
  }>;
};

export async function POST(
  _request: Request,
  { params }: RouteContext,
): Promise<Response> {
  try {
    const auth = await requireAdmin();

    if (!auth.ok) {
      return auth.response;
    }

    const { id } = await params;
    const result = await publishSchedulePeriod(id);

    if (!result.ok) {
      const response = {
        ok: false,
        error: result.error,
      } satisfies PublishScheduleResponse;

      const status = result.error.code === "SCHEDULE_NOT_FOUND" ? 404 : 409;

      return Response.json(response, { status });
    }

    const response = {
      ok: true,
      data: {
        period: mapSchedulePeriodToSchedule(result.data.period),
      },
    } satisfies PublishScheduleResponse;

    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error("Failed to publish schedule:", error);

    const response = {
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to publish schedule.",
      },
    } satisfies PublishScheduleResponse;

    return Response.json(response, { status: 500 });
  }
}
