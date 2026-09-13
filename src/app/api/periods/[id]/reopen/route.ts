import { METHOD_NOT_ALLOWED } from "@/app/api/_shared/responses";

import { requireAdmin } from "@/lib/auth/authorization";
import {
  reopenSchedule,
  type ReopenScheduleError,
} from "@/lib/useCases/reopenSchedule";

import type { UUID } from "@/types/common";
import type { ReopenScheduleResponse } from "@/types/scheduling";

type Params = {
  params: Promise<{
    id: UUID;
  }>;
};

const errorStatuses = {
  SCHEDULE_NOT_FOUND: 404,
  SCHEDULE_ALREADY_DRAFT: 409,
} satisfies Record<ReopenScheduleError["code"], number>;

export async function POST(
  _request: Request,
  { params }: Params,
): Promise<Response> {
  const auth = await requireAdmin();

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;

  try {
    const result = await reopenSchedule(id);

    if (!result.ok) {
      const response = {
        ok: false,
        error: {
          code: result.error.code,
          message: result.error.message,
        },
      } satisfies ReopenScheduleResponse;

      return Response.json(response, {
        status: errorStatuses[result.error.code],
      });
    }

    const response = {
      ok: true,
      data: result.data,
    } satisfies ReopenScheduleResponse;

    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error("Failed to reopen schedule", error);

    const response = {
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to reopen schedule.",
      },
    } satisfies ReopenScheduleResponse;

    return Response.json(response, { status: 500 });
  }
}
