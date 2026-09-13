// src/app/api/periods/[id]/clear-assignments/route.ts

import { requireAdmin } from "@/lib/auth/authorization";
import {
  clearScheduleAssignments,
  type ClearScheduleAssignmentsError,
} from "@/lib/useCases/clearScheduleAssignments";

import type { ApiResponse } from "@/types/api";

type ClearScheduleApiResponse = ApiResponse<
  { clearedCount: number },
  ClearScheduleAssignmentsError["code"]
>;

type RouteContext = {
  params: Promise<{ id: string }>;
};

const errorStatuses = {
  SCHEDULE_NOT_FOUND: 404,
  SCHEDULE_NOT_DRAFT: 409,
} satisfies Record<ClearScheduleAssignmentsError["code"], number>;

export async function POST(
  _request: Request,
  { params }: RouteContext,
): Promise<Response> {
  const auth = await requireAdmin();

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;

  try {
    const result = await clearScheduleAssignments(id);

    if (!result.ok) {
      const response = {
        ok: false,
        error: {
          code: result.error.code,
          message: result.error.message,
        },
      } satisfies ClearScheduleApiResponse;

      return Response.json(response, {
        status: errorStatuses[result.error.code],
      });
    }

    const response = {
      ok: true,
      data: {
        clearedCount: result.data.clearedCount,
      },
    } satisfies ClearScheduleApiResponse;

    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error("Failed to clear schedule assignments", error);

    const response = {
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to clear schedule assignments.",
      },
    } satisfies ClearScheduleApiResponse;

    return Response.json(response, { status: 500 });
  }
}
