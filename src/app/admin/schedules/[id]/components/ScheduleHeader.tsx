import Link from "next/link";

import * as ui from "@/ui/classes";

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
    <header className={ui.card}>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-xl font-bold text-white">
              {department}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className={ui.title}>{department} Department</h1>

                <span
                  className={
                    published
                      ? "inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm font-medium text-green-300"
                      : "inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-300"
                  }
                >
                  <span
                    className={
                      published
                        ? "h-2 w-2 rounded-full bg-green-400"
                        : "h-2 w-2 rounded-full bg-yellow-300"
                    }
                  />

                  {published ? "Published" : "Draft"}
                </span>
              </div>

              <p className={ui.subtitle}>
                Week {getISOWeekNumber(start)} • {formatDateOnly(start)} –{" "}
                {formatDateOnly(end)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {published && (
              <Link href={`/schedules/${periodId}`} className={ui.button}>
                View Published Schedule
              </Link>
            )}

            <Link href="/admin/schedules" className={ui.button}>
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid gap-4 md:grid-cols-3">
          <section className="rounded-lg border border-border bg-background-secondary p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-text-secondary">
              <span>📅</span>
              Schedule Period
            </p>

            <p className="font-medium">
              {formatDateOnly(start)} – {formatDateOnly(end)}
            </p>
          </section>

          <section className="rounded-lg border border-border bg-background-secondary p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-text-secondary">
              <span>🟢</span>
              Status
            </p>

            <p
              className={
                published
                  ? "font-medium text-green-400"
                  : "font-medium text-yellow-300"
              }
            >
              {published ? "Published" : "Draft"}
            </p>
          </section>

          <section className="rounded-lg border border-border bg-background-secondary p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-text-secondary">
              <span>#️⃣</span>
              Period ID
            </p>

            <p className="break-all text-sm">{periodId}</p>
          </section>
        </div>
      </div>
    </header>
  );
}
