import { requireAdmin } from "@/lib/auth/authorization";
import { reopenSchedule } from "@/lib/useCases/reopenSchedule";

import type { UUID } from "@/types/common";
import type { ReopenScheduleResponse } from "@/types/scheduling";

type Params = {
  params: Promise<{
    id: UUID;
  }>;
};

export async function POST(
  _request: Request,
  { params }: Params,
): Promise<Response> {
  try {
    const auth = await requireAdmin();

    if (!auth.ok) {
      return auth.response;
    }

    const { id } = await params;

    const result = await reopenSchedule(id);

    if (!result.ok) {
      const response = {
        ok: false,
        error: result.error,
      } satisfies ReopenScheduleResponse;

      return Response.json(response, { status: 404 });
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
