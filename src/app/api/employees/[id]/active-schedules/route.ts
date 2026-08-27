import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/authorization";
import { getActiveSchedulesForEmployee } from "@/lib/useCases/getActiveSchedulesForEmployee";

import type { UUID } from "@/types/common";
import type { ScheduleVisibility } from "@/lib/useCases/getActiveSchedulesForEmployee";
import { METHOD_NOT_ALLOWED } from "@/app/api/_shared/responses";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const VALID_VISIBILITIES: ScheduleVisibility[] = [
  "PUBLISHED_ONLY",
  "INCLUDE_UNPUBLISHED",
];

export async function GET(request: NextRequest, context: RouteContext) {
  const authError = await requireAdmin();

  if (authError) {
    return authError;
  }

  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          ok: false,
          error: "Employee id is required.",
        },
        {
          status: 400,
        },
      );
    }

    const visibilityParam = request.nextUrl.searchParams.get("visibility");

    if (
      !visibilityParam ||
      !VALID_VISIBILITIES.includes(visibilityParam as ScheduleVisibility)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid schedule visibility.",
        },
        {
          status: 400,
        },
      );
    }

    const visibility = visibilityParam as ScheduleVisibility;

    const schedules = await getActiveSchedulesForEmployee(
      id as UUID,
      visibility,
    );

    return NextResponse.json(
      {
        ok: true,
        schedules,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Failed to load active employee schedules:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to load active employee schedules.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST() {
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
