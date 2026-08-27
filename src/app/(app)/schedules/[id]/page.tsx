import Link from "next/link";
import { notFound } from "next/navigation";

import * as ui from "@/ui/classes";

import WeekGrid from "@/app/(app)/admin/schedules/[id]/components/scheduleViews/WeekGrid";

import { getSchedulePeriodById } from "@/lib/db/schedulePeriods";
import { toUiShiftSlots } from "@/lib/db/mappers";

import { getDepartmentLabel } from "@/lib/constants/departmentDisplay";
import { formatDateOnly } from "@/lib/functions/dateTimeUtils";

import type { UUID } from "@/types/common";
import type { ScheduleEmployee } from "@/types/employee";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function getDisplayEndDate(endDate: Date): Date {
  const displayEndDate = new Date(endDate);

  displayEndDate.setUTCDate(displayEndDate.getUTCDate() - 1);

  return displayEndDate;
}

function getScheduleEmployees(
  period: Awaited<ReturnType<typeof getSchedulePeriodById>>,
): ScheduleEmployee[] {
  if (!period) {
    return [];
  }

  const employeesById = new Map<UUID, ScheduleEmployee>();

  for (const slot of period.shiftSlots) {
    if (!slot.employee) {
      continue;
    }

    const employeeId = slot.employee.id as UUID;

    employeesById.set(employeeId, {
      id: employeeId,
      firstName: slot.employee.firstName,
      lastName: slot.employee.lastName,
    });
  }

  return Array.from(employeesById.values());
}

export default async function ScheduleDetailPage({ params }: Props) {
  const { id } = await params;

  const period = await getSchedulePeriodById(id);

  if (!period || period.status !== "PUBLISHED") {
    notFound();
  }

  const shiftSlots = toUiShiftSlots(period.shiftSlots);
  const employees = getScheduleEmployees(period);
  const displayEndDate = getDisplayEndDate(period.endDate);

  const departmentLabel = getDepartmentLabel(period.department);
  const periodLabel = `${formatDateOnly(period.startDate)} – ${formatDateOnly(
    displayEndDate,
  )}`;

  return (
    <main className={ui.page}>
      <header className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-5 border-b border-border bg-surface-muted px-5 py-4">
          <div>
            <p className={ui.caption}>Published schedule</p>

            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className={ui.pageTitle}>{departmentLabel}</h1>

              <span className={`${ui.badge} ${ui.badgeSuccess}`}>
                Published
              </span>
            </div>
          </div>

          <Link href="/schedules" className={ui.button}>
            Back to schedules
          </Link>
        </div>

        <div className="grid gap-4 px-5 py-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className={ui.caption}>Period</p>

            <p className={`${ui.bodyText} mt-1 font-medium`}>{periodLabel}</p>
          </div>

          <div>
            <p className={ui.caption}>Department</p>

            <p className={`${ui.bodyText} mt-1 font-medium`}>
              {departmentLabel}
            </p>
          </div>

          <div>
            <p className={ui.caption}>Assignments</p>

            <p className={`${ui.bodyText} mt-1 font-medium`}>
              {shiftSlots.length} {shiftSlots.length === 1 ? "shift" : "shifts"}
            </p>
          </div>
        </div>
      </header>

      <section className="space-y-3">
        <div>
          <h2 className={ui.sectionTitle}>Week overview</h2>

          <p className={ui.caption}>
            Published assignments across the full schedule period.
          </p>
        </div>

        <WeekGrid
          shiftSlots={shiftSlots}
          employees={employees}
          canAssign={false}
        />
      </section>
    </main>
  );
}
