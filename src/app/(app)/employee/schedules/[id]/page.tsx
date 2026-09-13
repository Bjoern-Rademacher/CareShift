import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import * as ui from "@/ui/classes";

import EmployeeShiftList from "@/app/(app)/employee/schedules/components/EmployeeShiftList";

import ScheduleStatusBadge from "@/lib/components/ScheduleStatusBadge";

import { getCurrentUser } from "@/lib/auth/currentUser";
import {
  DEPARTMENT_ICONS,
  getDepartmentLabel,
} from "@/lib/constants/departmentDisplay";
import {
  formatDurationHours,
  formatSchedulePeriodRange,
  getTotalDurationHours,
} from "@/lib/functions/dateTimeUtils";

import { getEmployeeScheduleById } from "@/lib/useCases/getEmployeeScheduleById";

type Props = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    from?: string;
  }>;
};

export default async function EmployeeSchedulePage({
  params,
  searchParams,
}: Props) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  if (user.role !== "EMPLOYEE" || typeof user.employeeId !== "string") {
    redirect("/dashboard");
  }

  const [{ id }, { from }] = await Promise.all([params, searchParams]);

  const fromDashboard = from === "dashboard";

  const backHref = fromDashboard ? "/dashboard" : "/employee/schedules";

  const schedule = await getEmployeeScheduleById(user.employeeId, id);

  // Missing, unpublished, and unassigned schedules are hidden.
  if (!schedule) {
    notFound();
  }

  const DepartmentIcon = DEPARTMENT_ICONS[schedule.period.department];

  const shiftCount = schedule.shiftSlots.length;
  const totalHours = getTotalDurationHours(schedule.shiftSlots);

  return (
    <div className={ui.page}>
      <header>
        <nav aria-label="Schedule navigation">
          <Link href={backHref} className={ui.dashboardActionLink}>
            <ArrowLeft className="size-4" aria-hidden="true" />

            {fromDashboard ? "Dashboard" : "My schedules"}
          </Link>
        </nav>

        <div
          className="
            mt-4 flex flex-wrap items-start
            justify-between gap-4
          "
        >
          <div>
            <div className="flex items-center gap-2">
              <DepartmentIcon
                className="size-5 text-foreground-subtle"
                aria-hidden="true"
              />

              <h1 className={ui.pageTitle}>
                {getDepartmentLabel(schedule.period.department)}
              </h1>
            </div>

            <p className={`${ui.bodyMuted} mt-1`}>
              {formatSchedulePeriodRange(
                new Date(schedule.period.startDate),
                new Date(schedule.period.endDate),
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ScheduleStatusBadge status={schedule.period.status} />

            <span className={`${ui.badge} ${ui.badgeNeutral}`}>
              {shiftCount} {shiftCount === 1 ? "shift" : "shifts"}
            </span>

            <span className={`${ui.badge} ${ui.badgeNeutral}`}>
              {formatDurationHours(totalHours)}
            </span>
          </div>
        </div>
      </header>

      <section className={ui.dashboardSectionCard}>
        <header className={ui.dashboardSectionHeader}>
          <div>
            <h2 className={ui.sectionTitle}>Assigned shifts</h2>

            <p className={ui.caption}>
              Your assignments in this published schedule.
            </p>
          </div>
        </header>

        <EmployeeShiftList shiftSlots={schedule.shiftSlots} />
      </section>

      <div className="flex w-full justify-end">
        <div
          className="
            inline-flex rounded-control border
            border-border bg-surface shadow-sm
          "
        >
          <button
            type="button"
            disabled
            title="Request changes is planned"
            className="
              inline-flex cursor-not-allowed items-center gap-2
              rounded-control px-3 py-2
              text-sm font-medium text-foreground-muted
              opacity-80
            "
          >
            Request change
            <span className={`${ui.badge} ${ui.badgeNeutral}`}>Planned</span>
          </button>
        </div>
      </div>
    </div>
  );
}
