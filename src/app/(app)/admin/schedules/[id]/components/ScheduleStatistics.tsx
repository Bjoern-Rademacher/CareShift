import { getShiftGroup } from "@/lib/functions/scheduleUtils";
import { getWeekday } from "@/lib/functions/dateTimeUtils";

import type { UUID } from "@/types/common";
import type { ShiftSlot } from "@/types/scheduling";

type Props = {
  shiftSlots: ShiftSlot[];
};

function getSlotHours(slot: ShiftSlot): number {
  return (
    (new Date(slot.endTime).getTime() - new Date(slot.startTime).getTime()) /
    (60 * 60 * 1000)
  );
}

function formatHours(hours: number): string {
  return Number.isInteger(hours) ? `${hours}` : hours.toFixed(1);
}

export default function ScheduleStatistics({ shiftSlots }: Props) {
  const totalSlots = shiftSlots.length;

  const assignedSlots = shiftSlots.filter((slot) => slot.employeeId !== null);

  const assignedCount = assignedSlots.length;
  const unassignedCount = totalSlots - assignedCount;

  const coverage =
    totalSlots === 0 ? 0 : Math.round((assignedCount / totalSlots) * 100);

  const scheduledHours = assignedSlots.reduce(
    (total, slot) => total + getSlotHours(slot),
    0,
  );

  const requiredHours = shiftSlots.reduce(
    (total, slot) => total + getSlotHours(slot),
    0,
  );

  const nightShiftCount = shiftSlots.filter(
    (slot) => getShiftGroup(slot.startTime) === "NIGHT",
  ).length;

  const weekendShiftCount = shiftSlots.filter((slot) => {
    const weekday = getWeekday(new Date(slot.startTime));

    return weekday === "SAT" || weekday === "SUN";
  }).length;

  const hoursByEmployee = new Map<UUID, number>();

  for (const slot of assignedSlots) {
    if (!slot.employeeId) continue;

    const currentHours = hoursByEmployee.get(slot.employeeId) ?? 0;

    hoursByEmployee.set(slot.employeeId, currentHours + getSlotHours(slot));
  }

  const employeeHours = [...hoursByEmployee.values()];
  const employeesScheduled = employeeHours.length;

  const averageHours =
    employeesScheduled === 0 ? 0 : scheduledHours / employeesScheduled;

  const maximumHours =
    employeesScheduled === 0 ? 0 : Math.max(...employeeHours);

  const minimumHours =
    employeesScheduled === 0 ? 0 : Math.min(...employeeHours);

  return (
    <section className="rounded-card border border-border bg-surface px-5 py-3 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <Statistic
          value={totalSlots}
          label="Slots"
          accentClass="text-primary"
        />

        <Statistic
          value={assignedCount}
          label="Assigned"
          accentClass="text-success"
        />

        <Statistic
          value={unassignedCount}
          label="Open"
          accentClass={unassignedCount > 0 ? "text-warning" : "text-success"}
        />

        <Statistic
          value={`${coverage}%`}
          label="Coverage"
          accentClass="text-primary"
        />

        <Statistic
          value={`${formatHours(scheduledHours)} / ${formatHours(requiredHours)} h`}
          label="Hours"
          accentClass="text-primary"
        />

        <Statistic
          value={nightShiftCount}
          label="Nights"
          accentClass="text-foreground"
        />

        <Statistic
          value={weekendShiftCount}
          label="Weekend"
          accentClass="text-warning"
        />

        <div className="h-8 w-px bg-border" />

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground-muted">
          <span>
            <strong className="font-medium text-foreground">
              {employeesScheduled}
            </strong>{" "}
            employees
          </span>

          <span className="text-foreground-subtle">•</span>

          <span>
            Avg{" "}
            <strong className="font-medium text-foreground">
              {formatHours(averageHours)} h
            </strong>
          </span>

          <span className="text-foreground-subtle">•</span>

          <span>
            Max{" "}
            <strong className="font-medium text-warning">
              {formatHours(maximumHours)} h
            </strong>
          </span>

          <span className="text-foreground-subtle">•</span>

          <span>
            Min{" "}
            <strong className="font-medium text-foreground">
              {formatHours(minimumHours)} h
            </strong>
          </span>
        </div>
      </div>
    </section>
  );
}

type StatisticProps = {
  value: string | number;
  label: string;
  accentClass: string;
};

function Statistic({ value, label, accentClass }: StatisticProps) {
  return (
    <div className="flex items-baseline gap-2 whitespace-nowrap">
      <span className={`text-base font-semibold ${accentClass}`}>{value}</span>

      <span className="text-xs text-foreground-muted">{label}</span>
    </div>
  );
}
