import { validateSchedule } from "@/functions/validateSchedule";
import { mockStore } from "@/lib/mock/store";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const period = mockStore.periods.find((p) => p.id === id);

  if (!period) {
    return Response.json(
      { ok: false, error: "Period not found" },
      { status: 404 },
    );
  }

  const shiftSlots = mockStore.shiftSlots.filter((s) => s.periodId === id);

  const errors = validateSchedule(period, shiftSlots, mockStore.employees);

  if (errors.length > 0) {
    return Response.json({ ok: false, errors }, { status: 200 });
  }

  period.status = "published";

  return Response.json({ ok: true, period }, { status: 200 });
}
