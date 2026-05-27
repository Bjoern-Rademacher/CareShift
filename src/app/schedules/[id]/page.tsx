import Link from "next/link";
import { notFound } from "next/navigation";

import * as ui from "@/ui/classes";

import SlotsTable from "@/app/admin/schedules/[id]/SlotsTable";

import { mockStore } from "@/lib/mock/store";

export default async function ScheduleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const period = mockStore.periods.find((p) => p.id === id);

  if (!period || period.status !== "published") {
    notFound();
  }

  const shiftSlots = mockStore.shiftSlots.filter(
    (slot) => slot.periodId === period.id,
  );

  return (
    <main className={ui.page}>
      <section className={`${ui.section} ${ui.card}`}>
        <h1 className={ui.title}>Published Schedule</h1>

        <p className={ui.subtitle}>Department: {period.department}</p>

        <p className={ui.subtitle}>
          Period: {period.startDate} — {period.endDate}
        </p>

        <SlotsTable
          shiftSlots={shiftSlots}
          employees={mockStore.employees}
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
