import { METHOD_NOT_ALLOWED } from "@/app/api/_shared/responses";

import { requireAdmin } from "@/lib/auth/authorization";
import { reopenSchedule } from "@/lib/useCases/reopenSchedule";

import type { UUID } from "@/types/common";

type Params = {
  params: Promise<{
    id: UUID;
  }>;
};

export async function POST(_request: Request, { params }: Params) {
  const auth = await requireAdmin();

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;

  try {
    const result = await reopenSchedule(id);

    if (!result.ok) {
      const status = result.code === "SCHEDULE_NOT_FOUND" ? 404 : 409;

      return Response.json(result, { status });
    }

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("Failed to reopen schedule", error);

    return Response.json(
      {
        ok: false,
        error: "Failed to reopen schedule.",
      },
      { status: 500 },
    );
  }
}

export function GET() {
  return METHOD_NOT_ALLOWED();
}

export function PUT() {
  return METHOD_NOT_ALLOWED();
}

export function PATCH() {
  return METHOD_NOT_ALLOWED();
}

export function DELETE() {
  return METHOD_NOT_ALLOWED();
}
