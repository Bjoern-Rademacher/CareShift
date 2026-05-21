import { mockStore } from "@/lib/mock/store";

export async function GET() {
  return Response.json({
    periods: mockStore.shiftSlots,
  });
}
