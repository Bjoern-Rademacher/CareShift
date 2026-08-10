import { notFound } from "next/navigation";

import { getCurrentUser } from "@/auth/currentUser";

import * as ui from "@/ui/classes";

import SlotsClient from "./components/SlotsClient";

import {
  mapSchedulePeriodToSchedule,
  mapShiftSlotToSchedule,
} from "@/lib/mappers/scheduleMappers";

import { getSchedulePeriodById } from "@/lib/db/schedulePeriods";
import { getAssignableEmployees } from "@/lib/db/employees";

export default async function PeriodsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const currentUser = await getCurrentUser();
  const canAssign = currentUser?.role === "admin";

  const [period, employees] = await Promise.all([
    getSchedulePeriodById(id),
    getAssignableEmployees(),
  ]);

  if (!period) {
    notFound();
  }

  // Map Prisma Date objects into serializable client-facing types.
  const schedulePeriod = mapSchedulePeriodToSchedule(period);

  const shiftSlots = period.shiftSlots.map(mapShiftSlotToSchedule);

  return (
    <main className={ui.page}>
      <section className={ui.section}>
        <SlotsClient
          schedulePeriod={schedulePeriod}
          shiftSlots={shiftSlots}
          employees={employees}
          canAssign={canAssign}
        />
      </section>
    </main>
  );
}
