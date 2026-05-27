import { mockStore } from "@/lib/mock/store";

import generateShiftSlots from "@/functions/generateShiftSlots";
import { createISODateString, getMonday } from "@/functions/verifyDate";

import type { Departments } from "@/types/common";
import type { Schedule } from "@/types/scheduling";

import { METHOD_NOT_ALLOWED } from "@/app/api/_shared/responses";

type CreateScheduleRequest = {
  department: Departments;
  weekStartDate: string; // YYYY-MM-DD from date input
};

export async function POST(request: Request) {
  const { department, weekStartDate }: CreateScheduleRequest =
    await request.json();

  if (!department || !weekStartDate) {
    return Response.json(
      {
        ok: false,
        error: "Department and week start date are required.",
      },
      { status: 200 },
    );
  }

  // user may select any date; backend normalizes it to monday
  const selectedDate = new Date(`${weekStartDate}T00:00:00Z`);
  const weekStartMonday = getMonday(selectedDate);

  const scheduleStartDate = createISODateString(
    weekStartMonday.toISOString().replace(".000Z", "Z"),
  );

  // schedule ends six days after monday
  const weekEndSunday = new Date(weekStartMonday);
  weekEndSunday.setUTCDate(weekEndSunday.getUTCDate() + 6);

  const scheduleEndDate = createISODateString(
    weekEndSunday.toISOString().replace(".000Z", "Z"),
  );

  const existingSchedule = mockStore.periods.find(
    (schedule) =>
      schedule.department === department &&
      schedule.startDate === scheduleStartDate,
  );

  if (existingSchedule) {
    return Response.json(
      {
        ok: false,
        code: "SCHEDULE_ALREADY_EXISTS",
        message:
          "This schedule already exists. You can continue editing the existing schedule.",
        scheduleId: existingSchedule.id,
      },
      { status: 200 },
    );
  }

  const schedule: Schedule = {
    id: crypto.randomUUID(),
    department,
    startDate: scheduleStartDate,
    endDate: scheduleEndDate,
    status: "draft",
  };

  const rules = mockStore.templateRules.filter(
    (rule) => rule.department === department && rule.active,
  );

  const shiftSlots = generateShiftSlots({
    periodId: schedule.id,
    weekStartDate: schedule.startDate,
    rules,
  });

  console.log("period count before create:", mockStore.periods.length);

  mockStore.periods.push(schedule);
  mockStore.shiftSlots.push(...shiftSlots);

  console.log("created schedule:", schedule.id);
  console.log("period count after create:", mockStore.periods.length);
  console.log(
    "can find created schedule:",
    Boolean(mockStore.periods.find((p) => p.id === schedule.id)),
  );

  return Response.json(
    {
      ok: true,
      schedule,
    },
    { status: 200 },
  );
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
