import { NextResponse } from "next/server";

import { METHOD_NOT_ALLOWED } from "@/app/api/_shared/responses";
import { requireAdmin } from "@/lib/auth/authorization";
import { getSchedulePeriods } from "@/lib/db/schedulePeriods";
import { mapSchedulePeriodToSchedule } from "@/lib/mappers/scheduleMappers";

export async function GET() {
  const auth = await requireAdmin();

  if (!auth.ok) {
    return auth.response;
  }

  const periods = await getSchedulePeriods();

  return NextResponse.json({
    ok: true,
    periods: periods.map(mapSchedulePeriodToSchedule),
  });
}

export function POST() {
  return METHOD_NOT_ALLOWED;
}

export function PATCH() {
  return METHOD_NOT_ALLOWED;
}

export function PUT() {
  return METHOD_NOT_ALLOWED;
}

export function DELETE() {
  return METHOD_NOT_ALLOWED;
}
