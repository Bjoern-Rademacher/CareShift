import Link from "next/link";
import { notFound } from "next/navigation";

import * as ui from "@/ui/classes";

import SlotsTable from "@/app/admin/schedules/[id]/SlotsTable";

import { getSchedulePeriodById } from "@/lib/db/schedulePeriods";
import { getAssignableEmployees } from "@/lib/db/employees";
import { formatDateOnly } from "@/lib/functions/verifyDate";
import { toUiShiftSlots } from "@/lib/db/mappers";

export default async function ScheduleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  console.log("ID:", id);

  const [period, employees] = await Promise.all([
    getSchedulePeriodById(id),
    getAssignableEmployees(),
  ]);

  console.log(employees, period);

  if (!period || !period.published) {
    notFound();
  }

  console.log("Employees", employees);

  const shiftSlots = toUiShiftSlots(period.shiftSlots);

  return (
    <main className={ui.page}>
      <section className={`${ui.section} ${ui.card}`}>
        <h1 className={ui.title}>Published Schedule</h1>

        <p className={ui.subtitle}>Department: {period.department}</p>

        <p className={ui.subtitle}>
          Period: {formatDateOnly(period.startDate)} —{" "}
          {formatDateOnly(period.endDate)}
        </p>

        <SlotsTable
          shiftSlots={shiftSlots}
          employees={employees}
          onAssignClick={() => {}}
          canAssign={false}
        />

        <Link href="/schedules" className={`${ui.button} mt-6`}>
          Back to published schedules
        </Link>
      </section>
    </main>
  );
}
