import Link from "next/link";

import {
  formatDateOnly,
  getISOWeekNumber,
} from "@/lib/functions/dateTimeUtils";

import type { Departments, ISODateString, UUID } from "@/types/common";

type Props = {
  periodId: UUID;
  department: Departments;
  startDate: ISODateString;
  endDate: ISODateString;
  published: boolean;
};

export default function ScheduleHeader({
  periodId,
  department,
  startDate,
  endDate,
  published,
}: Props) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return (
    <header className="mb-5">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-xl font-bold text-white">
              {department}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold text-slate-100">
                  {department} Department
                </h1>

                <span
                  className={
                    published
                      ? "inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-300"
                      : "inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-300"
                  }
                >
                  <span
                    className={
                      published
                        ? "h-2 w-2 rounded-full bg-emerald-400"
                        : "h-2 w-2 rounded-full bg-amber-400"
                    }
                  />

                  {published ? "Published" : "Draft"}
                </span>
              </div>

              <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                <span aria-hidden="true">▣</span>
                Week {getISOWeekNumber(start)} • {formatDateOnly(start)} –{" "}
                {formatDateOnly(end)}
              </p>
            </div>
          </div>

          <Link
            href="/admin/schedules"
            className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
          >
            <span aria-hidden="true">←</span>
            Back to Dashboard
          </Link>
        </div>

        <div className="grid overflow-hidden rounded-xl border border-slate-700 bg-slate-900/50 md:grid-cols-3">
          <section className="border-b border-slate-700 px-5 py-4 md:border-r md:border-b-0">
            <p className="flex items-center gap-2 text-sm text-slate-400">
              <span aria-hidden="true">▣</span>
              Schedule Period
            </p>

            <p className="mt-2 font-medium text-slate-100">
              {formatDateOnly(start)} – {formatDateOnly(end)}
            </p>
          </section>

          <section className="border-b border-slate-700 px-5 py-4 md:border-r md:border-b-0">
            <p className="flex items-center gap-2 text-sm text-slate-400">
              <span
                className={
                  published
                    ? "h-3 w-3 rounded-full bg-emerald-400"
                    : "h-3 w-3 rounded-full bg-lime-400"
                }
              />
              Status
            </p>

            <p
              className={
                published
                  ? "mt-2 font-medium text-emerald-300"
                  : "mt-2 font-medium text-amber-300"
              }
            >
              {published ? "Published" : "Draft"}
            </p>
          </section>

          <section className="px-5 py-4">
            <p className="flex items-center gap-2 text-sm text-slate-400">
              <span aria-hidden="true">#</span>
              Period ID
            </p>

            <p
              title={periodId}
              className="mt-2 truncate text-sm font-medium text-slate-200"
            >
              {periodId}
            </p>
          </section>
        </div>
      </div>
    </header>
  );
}
