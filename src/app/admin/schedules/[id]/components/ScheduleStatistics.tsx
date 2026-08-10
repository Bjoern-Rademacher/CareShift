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
    <section className="rounded-xl border border-slate-700 bg-slate-900/40 px-5 py-3">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <Statistic
          value={totalSlots}
          label="Slots"
          accentClass="text-violet-400"
        />

        <Statistic
          value={assignedCount}
          label="Assigned"
          accentClass="text-emerald-400"
        />

        <Statistic
          value={unassignedCount}
          label="Open"
          accentClass={
            unassignedCount > 0 ? "text-amber-400" : "text-emerald-400"
          }
        />

        <Statistic
          value={`${coverage}%`}
          label="Coverage"
          accentClass="text-sky-400"
        />

        <Statistic
          value={`${formatHours(scheduledHours)} / ${formatHours(requiredHours)} h`}
          label="Hours"
          accentClass="text-cyan-400"
        />

        <Statistic
          value={nightShiftCount}
          label="Nights"
          accentClass="text-violet-400"
        />

        <Statistic
          value={weekendShiftCount}
          label="Weekend"
          accentClass="text-orange-400"
        />

        <div className="h-8 w-px bg-slate-800" />

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
          <span>
            <strong className="font-medium text-slate-200">
              {employeesScheduled}
            </strong>{" "}
            employees
          </span>

          <span className="text-slate-600">•</span>

          <span>
            Avg{" "}
            <strong className="font-medium text-slate-200">
              {formatHours(averageHours)} h
            </strong>
          </span>

          <span className="text-slate-600">•</span>

          <span>
            Max{" "}
            <strong className="font-medium text-amber-300">
              {formatHours(maximumHours)} h
            </strong>
          </span>

          <span className="text-slate-600">•</span>

          <span>
            Min{" "}
            <strong className="font-medium text-slate-200">
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

      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}
