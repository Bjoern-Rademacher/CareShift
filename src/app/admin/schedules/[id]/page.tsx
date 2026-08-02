import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/auth/currentUser";

import * as ui from "@/ui/classes";

import SlotsClient from "@/app/admin/schedules/[id]/SlotsClient";

import { createISODateString } from "@/lib/functions/verifyDate";

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

  const shiftSlots = period.shiftSlots.map((slot) => ({
    id: slot.id,
    periodId: slot.periodId,
    employeeId: slot.employeeId,
    department: slot.department,
    position: slot.position,
    startTime: createISODateString(slot.startTime.toISOString()),
    endTime: createISODateString(slot.endTime.toISOString()),
  }));

  return (
    <main className={ui.page}>
      <section className={ui.section}>
        <h2 className={ui.title}>Department: {period.department}</h2>

        <p className={ui.subtitle}>
          Start Date: {period.startDate.toISOString()}
        </p>

        <p className={ui.subtitle}>Period ID: {period.id}</p>

        <p className={ui.subtitle}>
          Status: {period.published ? "published" : "draft"}
        </p>

        <SlotsClient
          periodId={id}
          shiftSlots={shiftSlots}
          employees={employees}
          canAssign={canAssign}
        />

        <Link className={ui.button} href="/admin/schedules">
          Back to schedules
        </Link>
      </section>
    </main>
  );
}
