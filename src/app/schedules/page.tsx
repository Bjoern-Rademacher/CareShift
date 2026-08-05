import Link from "next/link";

import * as ui from "@/ui/classes";

import { getPublishedSchedulePeriods } from "@/lib/db/schedulePeriods";

import { formatDateOnly } from "@/lib/functions/dateTimeUtils";
import { getDepartmentLabel } from "@/lib/functions/departments";

export default async function SchedulesPage() {
  const publishedPeriods = await getPublishedSchedulePeriods();

  return (
    <main className={ui.page}>
      <section className={`${ui.section} ${ui.card}`}>
        <h1 className={ui.title}>Published Schedules</h1>

        <p className={ui.subtitle}>
          View schedules that have passed validation and were published.
        </p>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {publishedPeriods.map((period) => (
            <article key={period.id} className={ui.card}>
              <h2 className="text-xl font-semibold">
                {getDepartmentLabel(period.department)}
              </h2>

              <p className={ui.subtitle}>
                {formatDateOnly(period.startDate)} —{" "}
                {formatDateOnly(period.endDate)}
              </p>
              <br />
              <Link
                href={`/schedules/${period.id}`}
                className={`${ui.button} mt-4`}
              >
                View schedule
              </Link>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
