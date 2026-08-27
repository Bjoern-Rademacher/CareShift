import Link from "next/link";

import { ArrowRight, CalendarDays } from "lucide-react";

import * as ui from "@/ui/classes";

import { getPublishedSchedulePeriods } from "@/lib/db/schedulePeriods";

import {
  formatSchedulePeriodRange,
  getISOWeekNumber,
} from "@/lib/functions/dateTimeUtils";
import { getDepartmentLabel } from "@/lib/constants/departmentDisplay";

type Props = {
  searchParams: Promise<{
    view?: string;
  }>;
};

type ScheduleView = "CURRENT_AND_FUTURE" | "PAST";

function getScheduleView(value: string | undefined): ScheduleView {
  return value === "past" ? "PAST" : "CURRENT_AND_FUTURE";
}

export default async function SchedulesPage({ searchParams }: Props) {
  const params = await searchParams;
  const view = getScheduleView(params.view);

  const periods = await getPublishedSchedulePeriods(view);

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
              <h1 className={ui.pageTitle}>Schedules</h1>

              <p className={`${ui.bodyMuted} mt-1`}>
                View published workforce schedules.
              </p>
            </div>
          </div>

          <div
            aria-label="Schedule period"
            className="
              inline-flex rounded-control border
              border-border bg-surface-muted p-1
            "
          >
            <Link
              href="/schedules"
              aria-current={view === "CURRENT_AND_FUTURE" ? "page" : undefined}
              className={
                `${ui.segmentedControlButton} ` +
                (view === "CURRENT_AND_FUTURE"
                  ? "bg-selected text-selected-foreground shadow-card"
                  : `
                    text-foreground-muted
                    hover:bg-surface-hover hover:text-foreground
                  `)
              }
            >
              Current &amp; Upcoming
            </Link>

            <Link
              href="/schedules?view=past"
              aria-current={view === "PAST" ? "page" : undefined}
              className={
                `${ui.segmentedControlButton} ` +
                (view === "PAST"
                  ? "bg-selected text-selected-foreground shadow-card"
                  : `
                    text-foreground-muted
                    hover:bg-surface-hover hover:text-foreground
                  `)
              }
            >
              Past 3 Months
            </Link>
          </div>
        </div>
      </header>

      <section
        className="
          overflow-hidden rounded-card border
          border-border bg-surface shadow-card
        "
      >
        <div className="border-b border-border px-4 py-3">
          <h2 className={ui.sectionTitle}>
            {view === "PAST"
              ? "Past Schedules"
              : "Current & Upcoming Schedules"}
          </h2>

          <p className={ui.caption}>
            {view === "PAST"
              ? "Published schedules from the previous three months."
              : "Published schedules from the current week onward."}
          </p>
        </div>

        {periods.length > 0 ? (
          <div>
            {periods.map((period) => (
              <Link
                key={period.id}
                href={`/schedules/${period.id}`}
                className={
                  "grid grid-cols-[1fr_1.5fr_auto_auto] " +
                  "items-center gap-4 border-b border-border " +
                  "px-4 py-3 last:border-b-0 " +
                  ui.rowHover
                }
              >
                <div>
                  <p className={ui.label}>
                    {getDepartmentLabel(period.department)}
                  </p>

                  <p className={ui.caption}>
                    Week {getISOWeekNumber(period.startDate)}
                  </p>
                </div>

                <p className={ui.bodyMuted}>
                  {formatSchedulePeriodRange(period.startDate, period.endDate)}
                </p>

                <span className={`${ui.badge} ${ui.badgeSuccess}`}>
                  Published
                </span>

                <ArrowRight
                  className="size-4 text-foreground-subtle"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-4 py-10 text-center">
            <p className={ui.bodyMuted}>
              {view === "PAST"
                ? "No published schedules were found in the previous three months."
                : "No published current or upcoming schedules are available."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
