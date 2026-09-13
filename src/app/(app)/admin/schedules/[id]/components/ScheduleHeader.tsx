import Link from "next/link";

import * as ui from "@/ui/classes";

import ScheduleStatusBadge from "@/lib/components/ScheduleStatusBadge";
import { getDepartmentLabel } from "@/lib/constants/departmentDisplay";

import { DEPARTMENT_ICONS } from "@/lib/constants/departmentDisplay";
import {
  formatSchedulePeriodRange,
  getISOWeekNumber,
} from "@/lib/functions/dateTimeUtils";

import type { SchedulePeriod } from "@/types/scheduling";

type Props = {
  schedulePeriod: SchedulePeriod;
};

export default function ScheduleHeader({ schedulePeriod }: Props) {
  const { id, department, startDate, endDate, status } = schedulePeriod;
  const start = new Date(startDate);
  const end = new Date(endDate);

  const DepartmentIcon = DEPARTMENT_ICONS[department];

  return (
    <header className="flex items-center justify-between gap-6 py-2">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-card bg-primary text-xl font-semibold text-primary-foreground">
          <DepartmentIcon />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className={ui.pageTitle}>{getDepartmentLabel(department)}</h1>

            <ScheduleStatusBadge status={status} />
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className={ui.caption}>Week {getISOWeekNumber(start)}</span>

            <span className="text-foreground-subtle">•</span>

            <span className={ui.caption}>
              {formatSchedulePeriodRange(start, end)}
            </span>

            <span className="text-foreground-subtle">•</span>

            <span className={`${ui.caption} truncate`}>ID {id}</span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Link href="/admin/schedules" className={ui.button}>
          ← Back to schedule planning
        </Link>
      </div>
    </header>
  );
}
