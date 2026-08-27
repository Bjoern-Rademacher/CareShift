import { notFound } from "next/navigation";

import * as ui from "@/ui/classes";

import SlotsClient from "./components/SlotsClient";

import { getAssignableEmployees } from "@/lib/db/employees";
import { getSchedulePeriodById } from "@/lib/db/schedulePeriods";
import {
  mapSchedulePeriodToSchedule,
  mapShiftSlotToSchedule,
} from "@/lib/mappers/scheduleMappers";

export default async function PeriodsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [period, employees] = await Promise.all([
    getSchedulePeriodById(id),
    getAssignableEmployees(),
  ]);

  if (!period) {
    notFound();
  }

  const schedulePeriod = mapSchedulePeriodToSchedule(period);
  const shiftSlots = period.shiftSlots.map(mapShiftSlotToSchedule);

  return (
    <div className={ui.page}>
      <section className={ui.section}>
        <SlotsClient
          key={schedulePeriod.id}
          schedulePeriod={schedulePeriod}
          shiftSlots={shiftSlots}
          employees={employees}
          canEdit={period.status === "DRAFT"}
        />
      </section>
    </div>
  );
}
