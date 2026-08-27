import Link from "next/link";

import * as ui from "@/ui/classes";

import ScheduleStatusBadge from "@/lib/components/ScheduleStatusBadge";

import {
  DEPARTMENT_ICONS,
  getDepartmentLabel,
} from "@/lib/constants/departmentDisplay";
import {
  formatDateOnly,
  formatSchedulePeriodRange,
  formatTimeOnly,
  formatWeekday,
  getTotalDurationHours,
} from "@/lib/functions/dateTimeUtils";
import { getPositionLabel } from "@/lib/functions/employeePositions";

import { EmployeeActiveSchedule } from "@/types/employee";

type Props = {
  schedule: EmployeeActiveSchedule;
};

export default function EmployeeScheduleCard({ schedule }: Props) {
  const { period, shiftSlots } = schedule;

  const DepartmentIcon = DEPARTMENT_ICONS[period.department];
  const shiftCount = shiftSlots.length;
  const totalHours = getTotalDurationHours(shiftSlots);

  return (
    <article
      className="
        overflow-hidden rounded-card border
        border-border-strong bg-surface shadow-card
      "
    >
      <header
        className="
          flex flex-wrap items-start justify-between gap-4
          border-b border-border bg-surface-muted px-4 py-4
        "
      >
        <div>
          <div className="flex items-center gap-2">
            <DepartmentIcon
              className="size-4 text-foreground-subtle"
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
            {formatHours(totalHours)} h
          </span>

          <span className={`${ui.badge} ${ui.badgeNeutral}`}>
            {shiftCount} {shiftCount === 1 ? "shift" : "shifts"}
          </span>

          <ScheduleStatusBadge status={period.status} />
        </div>
      </header>

      <div>
        {shiftSlots.map((slot) => (
          <Link
            key={slot.id}
            href={`/admin/schedules/${period.id}`}
            className={`
              grid gap-3 border-b border-border px-4 py-3
              last:border-b-0
              sm:grid-cols-[minmax(0,1fr)_minmax(9rem,0.7fr)_auto]
              sm:items-center
              ${ui.rowHover}
            `}
          >
            <div className="min-w-0">
              <p className={ui.label}>{formatShiftDay(slot.startTime)}</p>

              <p className={ui.caption}>
                {getPositionLabel(slot.position)} #{slot.slotNumber}
              </p>
            </div>

            <p className={ui.bodyMuted}>
              {formatTimeOnly(new Date(slot.startTime))} –{" "}
              {formatTimeOnly(new Date(slot.endTime))}
            </p>

            <span
              className={`
                ${ui.badge} ${ui.badgeNeutral}
                w-fit sm:justify-self-end
              `}
            >
              {getDepartmentLabel(slot.department)}
            </span>
          </Link>
        ))}
      </div>
    </article>
  );
}

function formatShiftDay(value: string) {
  const date = new Date(value);

  return `${formatWeekday(date)}, ${formatDateOnly(date)}`;
}

function formatHours(hours: number) {
  return Number.isInteger(hours) ? hours.toString() : hours.toFixed(1);
}
