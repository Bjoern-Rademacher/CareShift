import { METHOD_NOT_ALLOWED } from "@/app/api/_shared/responses";
import { requireAdmin } from "@/app/api/_shared/routeGuards";

import { getAssignmentCandidates } from "@/lib/useCases/getAssignmentCandidates";

import type { UUID } from "@/types/common";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      id: UUID;
    }>;
  },
) {
  const guardResponse = await requireAdmin();

  if (guardResponse) {
    return guardResponse;
  }

  try {
    const { id } = await context.params;

    const candidates = await getAssignmentCandidates(id);

    return Response.json(
      {
        ok: true,
        candidates,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Loading assignment candidates failed:", error);

    return Response.json(
      {
        ok: false,
        error: "Could not load assignment candidates.",
      },
      { status: 500 },
    );
  }
}

export function POST() {
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
