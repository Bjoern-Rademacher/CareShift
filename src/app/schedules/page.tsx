import Link from "next/link";

import * as ui from "@/ui/classes";
import { mockStore } from "@/lib/mock/store";

export default function SchedulesPage() {
  const publishedPeriods = mockStore.periods.filter(
    (period) => period.status === "published",
  );

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
              <h2 className="text-xl font-semibold">{period.department}</h2>

              <p className={ui.subtitle}>
                {period.startDate} — {period.endDate}
              </p>

              <p className="mt-2 text-sm">Status: {period.status}</p>

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
