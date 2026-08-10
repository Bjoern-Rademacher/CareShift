// app/api/periods/[id]/autofill/route.ts

import { METHOD_NOT_ALLOWED } from "@/app/api/_shared/responses";
import { requireAdmin } from "@/app/api/_shared/routeGuards";

import { autofillSchedule } from "@/lib/useCases/autofillSchedule";

import type { AutofillStrategy } from "@/types/autofill";
import type { UUID } from "@/types/common";

type Params = {
  params: Promise<{
    id: UUID;
  }>;
};

type RequestBody = {
  scope: {
    type: "ALL_OPEN";
  };
  strategy: AutofillStrategy;
};

export async function POST(request: Request, { params }: Params) {
  const guardResponse = await requireAdmin();

  if (guardResponse) {
    return guardResponse;
  }

  const { id } = await params;
  const body = (await request.json()) as RequestBody;

  const result = await autofillSchedule({
    periodId: id,
    scope: body.scope,
    strategy: body.strategy,
  });

  return Response.json({
    ok: true,
    result,
  });
}

export async function GET() {
  return METHOD_NOT_ALLOWED();
}

export async function PUT() {
  return METHOD_NOT_ALLOWED();
}

export async function PATCH() {
  return METHOD_NOT_ALLOWED();
}

export async function DELETE() {
  return METHOD_NOT_ALLOWED();
}
