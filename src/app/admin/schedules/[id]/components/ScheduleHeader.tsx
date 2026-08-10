import Link from "next/link";

import {
  formatDateOnly,
  getISOWeekNumber,
} from "@/lib/functions/dateTimeUtils";

import type { Departments } from "@/types/common";
import type { SchedulePeriod } from "@/types/scheduling";

type Props = {
  schedulePeriod: SchedulePeriod;
};

function formatDepartment(department: Departments): string {
  switch (department) {
    case "ER":
      return "ER Department";

    case "ICU":
      return "ICU Department";

    case "SURGERY":
      return "Surgery Department";

    case "RADIOLOGY":
      return "Radiology Department";
  }
}

export default function ScheduleHeader({ schedulePeriod }: Props) {
  const { id, department, startDate, endDate, published } = schedulePeriod;

  const start = new Date(startDate);
  const end = new Date(endDate);

  const weekNumber = getISOWeekNumber(start);

  return (
    <header className="flex items-center justify-between gap-6 py-2">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-xl font-semibold text-white">
          {department}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold text-slate-100">
              {formatDepartment(department)}
            </h1>

            <span
              className={
                published
                  ? "rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300"
                  : "rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-300"
              }
            >
              {published ? "Published" : "Draft"}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>Week {weekNumber}</span>

            <span className="text-slate-600">•</span>

            <span>
              {formatDateOnly(start)} – {formatDateOnly(end)}
            </span>

            <span className="text-slate-600">•</span>

            <span className="truncate text-slate-500">ID {id}</span>
          </div>
        </div>
      </div>

      <Link
        href="/dashboard"
        className="shrink-0 rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
      >
        ← Back to Dashboard
      </Link>
    </header>
  );
}
