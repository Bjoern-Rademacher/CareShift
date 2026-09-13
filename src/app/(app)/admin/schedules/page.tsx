import Link from "next/link";

import { ArrowRight, CalendarDays } from "lucide-react";

import * as ui from "@/ui/classes";

import CreateScheduleButton from "@/lib/components/CreateScheduleButton";
import ScheduleStatusBadge from "@/lib/components/ScheduleStatusBadge";

import { getAdminSchedulesData } from "@/lib/useCases/getAdminSchedulesData";

import { getDepartmentLabel } from "@/lib/functions/departments";
import {
  formatSchedulePeriodRange,
  getISOWeekNumber,
} from "@/lib/functions/dateTimeUtils";

import { DEPARTMENTS } from "@/types/common";

import type { Departments } from "@/types/common";
import type { SchedulePeriodOverview } from "@/types/scheduling";

function PlanningCell({
  department,
  weekStart,
  period,
}: {
  department: Departments;
  weekStart: Date;
  period: SchedulePeriodOverview | undefined;
}) {
  if (!period) {
    return (
      <div
        className="
          flex min-h-32 flex-col justify-between
          rounded-card border border-dashed
          border-border-strong bg-surface-muted p-3
        "
      >
        <div>
          <span className={`${ui.badge} ${ui.badgeDanger}`}>Missing</span>

          <p className={`${ui.caption} mt-2`}>No schedule created.</p>
        </div>

        <div className="flex justify-end">
          <CreateScheduleButton
            size="compact"
            department={department}
            weekStart={weekStart}
          />
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/admin/schedules/${period.id}`}
      className="
        flex min-h-32 flex-col justify-between
        rounded-card border border-border bg-surface p-3
        transition-colors duration-fast
        hover:bg-surface-hover
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-ring
      "
    >
      <div>
        <ScheduleStatusBadge status={period.status} />

        <p className={`${ui.caption} mt-2`}>
          {formatSchedulePeriodRange(period.startDate, period.endDate)}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className={ui.label}>
          {period.status === "DRAFT" ? "Edit schedule" : "Open schedule"}
        </span>

        <ArrowRight
          className="size-4 text-foreground-subtle"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}

export default async function AdminSchedulesPage() {
  const { weeks, periods } = await getAdminSchedulesData();

  return (
    <div className={ui.page}>
      <header
        className="
          rounded-card border border-border
          bg-surface p-5 shadow-card
        "
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span
              aria-hidden="true"
              className="
                grid size-11 shrink-0 place-items-center
                rounded-control bg-selected
                text-selected-foreground
              "
            >
              <CalendarDays className="size-5" />
            </span>

            <div className="min-w-0">
              <h1 className={ui.pageTitle}>Schedule Planning</h1>

              <p className={`${ui.bodyMuted} mt-1`}>
                Create and manage schedules for the upcoming three weeks.
              </p>
            </div>
          </div>

          <CreateScheduleButton />
        </div>
      </header>

      <section className={ui.section}>
        <div>
          <h2 className={ui.sectionTitle}>Upcoming Planning</h2>

          <p className={ui.caption}>
            One schedule is expected for every department and week.
          </p>
        </div>

        <div
          className="
            overflow-x-auto rounded-card border
            border-border bg-surface shadow-card
          "
        >
          <div className="min-w-[900px]">
            <div
              className="
                grid
                grid-cols-[160px_repeat(3,minmax(220px,1fr))]
                border-b border-border bg-surface-muted
              "
            >
              <div className="px-4 py-3">
                <span className={ui.caption}>Department</span>
              </div>

              {weeks.map((week) => (
                <div
                  key={week.startDate.toISOString()}
                  className="border-l border-border px-4 py-3"
                >
                  <p className={ui.label}>
                    Week {getISOWeekNumber(week.startDate)}
                  </p>

                  <p className={ui.caption}>
                    {formatSchedulePeriodRange(week.startDate, week.endDate)}
                  </p>
                </div>
              ))}
            </div>

            {DEPARTMENTS.map((department) => (
              <div
                key={department}
                className="
                  grid
                  grid-cols-[160px_repeat(3,minmax(220px,1fr))]
                  border-b border-border
                  last:border-b-0
                "
              >
                <div className="flex items-center px-4 py-4">
                  <p className={ui.label}>{getDepartmentLabel(department)}</p>
                </div>

                {weeks.map((week) => {
                  const period = periods.find(
                    (candidate) =>
                      candidate.department === department &&
                      candidate.startDate.getTime() ===
                        week.startDate.getTime(),
                  );

                  return (
                    <div
                      key={`${department}-${week.startDate.toISOString()}`}
                      className="border-l border-border p-3"
                    >
                      <PlanningCell
                        department={department}
                        weekStart={week.startDate}
                        period={period}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
