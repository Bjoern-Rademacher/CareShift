import Link from "next/link";

import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  Hospital,
  LayoutDashboard,
} from "lucide-react";

import * as ui from "@/ui/classes";

import DashboardScheduleList from "@/app/(app)/dashboard/components/DashboardScheduleList";
import EmployeeShiftList from "@/app/(app)/employee/schedules/components/EmployeeShiftList";

import { getDepartmentLabel } from "@/lib/functions/departments";
import {
  formatSchedulePeriodRange,
  getISOWeekNumber,
} from "@/lib/functions/dateTimeUtils";

import type {
  EmployeeDashboardData,
  EmployeeDashboardPeriod,
} from "@/types/dashboard";
import type { ShiftSlot } from "@/types/scheduling";

type Props = {
  data: EmployeeDashboardData;
};

export default function EmployeeView({ data }: Props) {
  const { currentWeekPeriods, currentWeekShiftSlots, upcomingPeriods } = data;

  return (
    <div className={ui.page}>
      <header className="rounded-card border border-border bg-surface p-5 shadow-card">
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="grid size-11 shrink-0 place-items-center rounded-control bg-selected text-selected-foreground"
          >
            <LayoutDashboard className="size-5" />
          </span>

          <div className="min-w-0">
            <h1 className={ui.pageTitle}>My Dashboard</h1>

            <p className={`${ui.bodyMuted} mt-1`}>
              Your published schedules for the current and upcoming weeks.
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-5">
        <CurrentWeekSection
          periods={currentWeekPeriods}
          shiftSlots={currentWeekShiftSlots}
        />

        <DashboardScheduleList
          title="Upcoming 3 Weeks"
          description="Published schedules containing one or more of your shifts."
          periods={upcomingPeriods}
          emptyMessage="You have no published schedules in the next three weeks."
          getHref={(period) => `/employee/schedules/${period.id}`}
          renderTrailing={(period) => (
            <AssignedShiftBadge count={period.assignedShiftCount} />
          )}
          action={
            <Link href="/employee/schedules" className={ui.dashboardActionLink}>
              View all
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          }
          listClassName="max-h-[520px] overflow-y-auto"
        />
      </div>
    </div>
  );
}

function CurrentWeekSection({
  periods,
  shiftSlots,
}: {
  periods: EmployeeDashboardPeriod[];
  shiftSlots: ShiftSlot[];
}) {
  return (
    <section className={ui.dashboardSectionCard}>
      <div
        className={`${ui.dashboardSectionHeader} flex items-center gap-3 border-b border-border`}
      >
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-control bg-selected text-selected-foreground"
        >
          <CalendarClock className="size-5" />
        </span>

        <div className="min-w-0">
          <h2 className={ui.sectionTitle}>Current Week</h2>

          <p className={ui.caption}>
            Published schedules containing one or more of your shifts.
          </p>
        </div>
      </div>

      {periods.length > 0 ? (
        <div className="space-y-4 bg-surface-muted p-4">
          {periods.map((period) => {
            const periodShiftSlots = shiftSlots.filter(
              (shiftSlot) => shiftSlot.periodId === period.id,
            );

            return (
              <CurrentWeekPeriod
                key={period.id}
                period={period}
                shiftSlots={periodShiftSlots}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-surface-muted p-4">
          <div className={ui.dashboardEmptyState}>
            <CalendarDays
              className="mx-auto size-6 text-foreground-subtle"
              aria-hidden="true"
            />

            <p className={`${ui.bodyMuted} mt-2`}>
              You have no published schedule for the current week.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function CurrentWeekPeriod({
  period,
  shiftSlots,
}: {
  period: EmployeeDashboardPeriod;
  shiftSlots: ShiftSlot[];
}) {
  return (
    <div className="overflow-hidden rounded-card border border-border border-l-2 border-l-primary bg-surface">
      <div className="border-b border-border bg-surface-muted">
        <Link
          href={`/employee/schedules/${period.id}?from=dashboard`}
          className="
    grid grid-cols-[1fr_auto_1fr] items-center gap-4
    px-4 py-3 transition-colors hover:bg-surface-hover
  "
        >
          <div className="justify-self-start">
            <span className={`${ui.badge} ${ui.badgeNeutral}`}>
              Week {getISOWeekNumber(period.startDate)}
            </span>
          </div>

          <div className="min-w-0 text-center">
            <div className="flex items-center justify-center gap-2">
              <Hospital
                className="size-4 shrink-0 text-primary"
                aria-hidden="true"
              />

              <p className={ui.cardTitle}>
                {getDepartmentLabel(period.department)}
              </p>
            </div>

            <p className={`${ui.caption} mt-1 whitespace-nowrap`}>
              {formatSchedulePeriodRange(period.startDate, period.endDate)}
            </p>
          </div>

          <div className="flex items-center justify-self-end gap-3">
            <AssignedShiftBadge count={period.assignedShiftCount} />

            <ArrowRight
              className="size-4 shrink-0 text-foreground-subtle"
              aria-hidden="true"
            />
          </div>
        </Link>
      </div>

      <EmployeeShiftList shiftSlots={shiftSlots} />
    </div>
  );
}

function AssignedShiftBadge({ count }: { count: number }) {
  return (
    <span className={`${ui.badge} ${ui.badgeNeutral}`}>
      {count === 1 ? "1 assigned shift" : `${count} assigned shifts`}
    </span>
  );
}
