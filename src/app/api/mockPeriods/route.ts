import { mockStore } from "@/lib/mock/store";

import { METHOD_NOT_ALLOWED } from "@/app/api/_shared/responses";

export async function GET() {
  return Response.json({
    periods: mockStore.periods,
  });
}

export function POST() {
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
