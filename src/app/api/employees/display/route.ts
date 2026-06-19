import { NextResponse } from "next/server";
import { METHOD_NOT_ALLOWED } from "@/app/api/_shared/responses";
import { getDisplayEmployees } from "@/lib/db/employees";
import type { EmployeeStatus } from "@/types/employee";

function isEmployeeStatus(value: string | null): value is EmployeeStatus {
  return value === "ACTIVE" || value === "DISABLED";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const statusParam = searchParams.get("status");

  const employees = isEmployeeStatus(statusParam)
    ? await getDisplayEmployees(statusParam)
    : await getDisplayEmployees();

  return NextResponse.json({
    ok: true,
    employees,
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
