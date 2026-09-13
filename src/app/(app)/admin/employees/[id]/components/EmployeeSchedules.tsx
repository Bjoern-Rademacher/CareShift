import { CalendarX2 } from "lucide-react";

import * as ui from "@/ui/classes";

import EmployeeScheduleCard from "./EmployeeScheduleCard";

import type { EmployeeActiveSchedule } from "@/types/employee";

type Props = {
  activeSchedules: EmployeeActiveSchedule[];
};

export default function EmployeeSchedules({ activeSchedules }: Props) {
  const scheduleCount = activeSchedules.length;

  return (
    <section className="space-y-4">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h2 className={ui.sectionTitle}>Active schedules</h2>

          <p className={`${ui.bodyMuted} mt-1`}>
            Current and upcoming assignments, including unpublished schedules.
          </p>
        </div>

        <span className={`${ui.badge} ${ui.badgeNeutral} shrink-0`}>
          {scheduleCount} {scheduleCount === 1 ? "schedule" : "schedules"}
        </span>
      </header>

      {scheduleCount === 0 ? (
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
            This employee has no current or upcoming assigned schedules.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {activeSchedules.map((schedule) => (
            <li key={schedule.period.id}>
              <EmployeeScheduleCard schedule={schedule} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
