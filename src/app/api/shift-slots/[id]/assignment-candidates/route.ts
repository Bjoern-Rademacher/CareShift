import { requireAdmin } from "@/lib/auth/authorization";
import {
  getAssignmentCandidates,
  type GetAssignmentCandidatesError,
} from "@/lib/useCases/getAssignmentCandidates";

import type { GetAssignmentCandidatesResponse } from "@/types/assignment";
import type { UUID } from "@/types/common";

const errorStatuses = {
  SHIFT_SLOT_NOT_FOUND: 404,
} satisfies Record<GetAssignmentCandidatesError["code"], number>;

type Context = {
  params: Promise<{
    id: UUID;
  }>;
};

export async function GET(
  _request: Request,
  { params }: Context,
): Promise<Response> {
  const auth = await requireAdmin();

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { id } = await params;

    const result = await getAssignmentCandidates(id);

    if (!result.ok) {
      const response = {
        ok: false,
        error: {
          code: result.error.code,
          message: result.error.message,
        },
      } satisfies GetAssignmentCandidatesResponse;

      return Response.json(response, {
        status: errorStatuses[result.error.code],
      });
    }

    const response = {
      ok: true,
      data: {
        candidates: result.data.candidates,
      },
    } satisfies GetAssignmentCandidatesResponse;

    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error("Loading assignment candidates failed:", error);

    const response = {
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Could not load assignment candidates.",
      },
    } satisfies GetAssignmentCandidatesResponse;

    return Response.json(response, { status: 500 });
  }
}
