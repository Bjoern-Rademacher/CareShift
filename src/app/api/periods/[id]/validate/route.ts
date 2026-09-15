import { requireAdmin } from "@/lib/auth/authorization";

import {
  validateSchedulePeriod,
  type ValidateSchedulePeriodError,
} from "@/lib/useCases/validateSchedulePeriod";

import type { UUID } from "@/types/common";
import type { ValidateScheduleResponse } from "@/types/scheduling";

type RouteContext = {
  params: Promise<{
    id: UUID;
  }>;
};

const errorStatuses = {
  SCHEDULE_NOT_FOUND: 404,
  SCHEDULE_ALREADY_PUBLISHED: 409,
  SCHEDULE_VALIDATION_FAILED: 409,
} satisfies Record<ValidateSchedulePeriodError["code"], number>;

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

    const result = await validateSchedulePeriod(id);

    if (!result.ok) {
      const response = {
        ok: false,
        error: {
          code: result.error.code,
          message: result.error.message,
          ...("issues" in result.error ? { issues: result.error.issues } : {}),
        },
      } satisfies ValidateScheduleResponse;

      return Response.json(response, {
        status: errorStatuses[result.error.code],
      });
    }

    const response = {
      ok: true,
      data: {
        period: result.data.period,
      },
    } satisfies ValidateScheduleResponse;

    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error("Failed to validate schedule:", error);

    const response = {
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to validate schedule.",
      },
    } satisfies ValidateScheduleResponse;

    return Response.json(response, { status: 500 });
  }
}
