"use client";

import { useState } from "react";

import Link from "next/link";

import { ArrowRight, CalendarRange, CalendarX2 } from "lucide-react";

import * as ui from "@/ui/classes";

import EmployeeShiftList from "@/app/(app)/employee/schedules/components/EmployeeShiftList";

import {
  DEPARTMENT_ICONS,
  getDepartmentLabel,
} from "@/lib/constants/departmentDisplay";
import {
  formatDurationHours,
  formatSchedulePeriodRange,
  getTotalDurationHours,
} from "@/lib/functions/dateTimeUtils";

import type { ReactNode } from "react";
import type { EmployeeScheduleOverview } from "@/types/scheduling";

type Props = {
  currentSchedules: EmployeeScheduleOverview[];
  pastSchedules: EmployeeScheduleOverview[];
};

type ScheduleView = "CURRENT" | "PAST";

export default function EmployeeSchedulesView({
  currentSchedules,
  pastSchedules,
}: Props) {
  const [view, setView] = useState<ScheduleView>("CURRENT");

  const schedules = view === "CURRENT" ? currentSchedules : pastSchedules;

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
              <CalendarRange className="size-5" />
            </span>

            <div className="min-w-0">
              <h1 className={ui.pageTitle}>My schedules</h1>

              <p className={`${ui.bodyMuted} mt-1`}>
                Review your published schedules and assigned shifts.
              </p>
            </div>
          </div>

          <div
            role="group"
            aria-label="Schedule period"
            className="
              inline-flex rounded-control border
              border-border bg-surface-muted p-1
            "
          >
            <ViewButton
              active={view === "CURRENT"}
              count={currentSchedules.length}
              onClick={() => setView("CURRENT")}
            >
              Current &amp; upcoming
            </ViewButton>

            <ViewButton
              active={view === "PAST"}
              count={pastSchedules.length}
              onClick={() => setView("PAST")}
            >
              Past 3 months
            </ViewButton>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <header>
          <h2 className={ui.sectionTitle}>
            {view === "CURRENT" ? "Current and upcoming" : "Past 3 months"}
          </h2>

          <p className={`${ui.bodyMuted} mt-1`}>
            {view === "CURRENT"
              ? "All current and future schedules containing your shifts."
              : "Published schedules containing your shifts from the previous three months."}
          </p>
        </header>

        {schedules.length > 0 ? (
          <ul className="space-y-4">
            {schedules.map((schedule) => (
              <li key={schedule.period.id}>
                <ScheduleCard schedule={schedule} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState view={view} />
        )}
      </section>
    </div>
  );
}

function ViewButton({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean;
  count: number;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`
        ${ui.segmentedControlButton}
        flex items-center gap-2
        ${
          active
            ? "bg-selected text-selected-foreground shadow-sm"
            : `
              text-foreground-muted
              hover:bg-surface-hover hover:text-foreground
            `
        }
      `}
    >
      {children}

      <span
        className={`
          rounded-full px-1.5 py-0.5
          text-[0.65rem] leading-none
          ${
            active
              ? "bg-selected-foreground/15 text-selected-foreground"
              : "bg-surface text-foreground-subtle"
          }
        `}
      >
        {count}
      </span>
    </button>
  );
}

function ScheduleCard({ schedule }: { schedule: EmployeeScheduleOverview }) {
  const { period, shiftSlots } = schedule;

  const DepartmentIcon = DEPARTMENT_ICONS[period.department];
  const shiftCount = shiftSlots.length;
  const totalHours = getTotalDurationHours(shiftSlots);

  return (
    <article
      className="
        overflow-hidden rounded-card border
        border-border bg-surface shadow-card
      "
    >
      <header
        className="
          flex flex-wrap items-start justify-between gap-4
          border-b border-border bg-surface-muted px-4 py-4
        "
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <DepartmentIcon
              className="size-4 shrink-0 text-foreground-subtle"
              aria-hidden="true"
            />

            <h3 className={ui.cardTitle}>
              {getDepartmentLabel(period.department)}
            </h3>
          </div>

          <p className={`${ui.caption} mt-1`}>
            {formatSchedulePeriodRange(
              new Date(period.startDate),
              new Date(period.endDate),
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className={`${ui.badge} ${ui.badgeNeutral}`}>
            {formatDurationHours(totalHours)}
          </span>

          <span className={`${ui.badge} ${ui.badgeNeutral}`}>
            {shiftCount} {shiftCount === 1 ? "shift" : "shifts"}
          </span>

          <Link
            href={`/employee/schedules/${period.id}?from=myschedules`}
            className={ui.dashboardActionLink}
          >
            View schedule
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <EmployeeShiftList shiftSlots={shiftSlots} />
    </article>
  );
}

function EmptyState({ view }: { view: ScheduleView }) {
  return (
    <div
      className="
        rounded-card border border-border bg-surface
        px-4 py-12 text-center shadow-card
      "
    >
      <CalendarX2
        className="mx-auto size-7 text-foreground-subtle"
        aria-hidden="true"
      />

      <p className={`${ui.bodyMuted} mt-3`}>
        {view === "CURRENT"
          ? "You have no current or upcoming published schedules."
          : "You had no published schedules during the previous three months."}
      </p>
    </div>
  );
}
