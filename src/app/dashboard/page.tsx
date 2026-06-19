import Link from "next/link";

import * as ui from "@/ui/classes";

const dashboardLinks = [
  {
    href: "/admin/schedules",
    title: "Manage Periods",
    description: "Assign staff, review draft schedules, and publish periods.",
    disabled: false,
  },
  {
    href: "/admin/schedules/create",
    title: "Create Schedule",
    description: "Generate a new schedule period from department rules.",
    disabled: false,
  },
  {
    href: "/employees",
    title: "Employees",
    description: "View staff, departments, positions, and access roles.",
    disabled: false,
  },
  {
    href: "/schedules",
    title: "Published Schedules",
    description: "Review schedules that are already published.",
    disabled: false,
  },
];

export default function DashboardPage() {
  return (
    <main className={ui.page}>
      <section className={`${ui.card}${ui.section}`}>
        <h1 className={ui.title}>Admin Dashboard</h1>

        <p className={ui.subtitle}>
          Manage schedule periods, staff assignments, and published plans.
        </p>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {dashboardLinks.map((item) =>
            item.disabled ? (
              <article key={item.title} className={`${ui.card} opacity-50`}>
                <h2 className="text-xl font-semibold">{item.title}</h2>
                <p className={ui.subtitle}>{item.description}</p>
                <p className="mt-4 text-sm">Coming soon</p>
              </article>
            ) : (
              <Link key={item.title} href={item.href} className={ui.card}>
                <h2 className="text-xl font-semibold">{item.title}</h2>
                <p className={ui.subtitle}>{item.description}</p>
                <p className="mt-4 font-medium">Open →</p>
              </Link>
            ),
          )}
        </section>
      </section>
    </main>
  );
}
