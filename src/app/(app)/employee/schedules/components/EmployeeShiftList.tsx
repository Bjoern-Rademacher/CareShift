import { Clock3 } from "lucide-react";

import * as ui from "@/ui/classes";

import {
  DEPARTMENT_ICONS,
  getDepartmentLabel,
} from "@/lib/constants/departmentDisplay";
import { getPositionLabel } from "@/lib/constants/employeeDisplay";
import {
  formatTimeOnly,
  formatWeekdayDate,
} from "@/lib/functions/dateTimeUtils";

import type { ShiftSlot } from "@/types/scheduling";

type Props = {
  shiftSlots: readonly ShiftSlot[];
};

export default function EmployeeShiftList({ shiftSlots }: Props) {
  return (
    <ul className="divide-y divide-border">
      {shiftSlots.map((slot) => {
        const DepartmentIcon = DEPARTMENT_ICONS[slot.department];

        return (
          <li
            key={slot.id}
            className="
              grid gap-3 px-4 py-3
              sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]
              sm:items-center
            "
          >
            <div className="min-w-0">
              <p className={ui.label}>{formatWeekdayDate(slot.startTime)}</p>

              <p className={ui.caption}>
                {getPositionLabel(slot.position)} #{slot.slotNumber}
              </p>
            </div>

            <p
              className={`
                ${ui.bodyMuted}
                flex items-center gap-2 whitespace-nowrap
                sm:justify-self-center
              `}
            >
              <Clock3
                className="size-4 shrink-0 text-foreground-subtle"
                aria-hidden="true"
              />
              {formatTimeOnly(new Date(slot.startTime))} –{" "}
              {formatTimeOnly(new Date(slot.endTime))}
            </p>

            <span
              className={`
                ${ui.badge} ${ui.badgeNeutral}
                w-fit gap-1.5 sm:justify-self-end
              `}
            >
              <DepartmentIcon className="size-3.5" aria-hidden="true" />

              {getDepartmentLabel(slot.department)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
