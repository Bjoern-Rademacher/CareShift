import Link from "next/link";

import { ArrowLeft, CalendarCheck2 } from "lucide-react";

import * as ui from "@/ui/classes";

import {
  DEPARTMENT_ICONS,
  getDepartmentLabel,
} from "@/lib/constants/departmentDisplay";
import {
  EMPLOYEE_POSITION_ICONS,
  getEmployeeFullName,
  getEmployeeInitials,
  getPositionLabel,
} from "@/lib/constants/employeeDisplay";

import type { ReactNode } from "react";
import type { EmployeePosition } from "@/types/common";
import type {
  AssignableEmployee,
  EmployeeActiveSchedule,
} from "@/types/employee";

type Props = {
  employee: AssignableEmployee;
  activeSchedules: EmployeeActiveSchedule[];
};

export default function EmployeeSummary({ employee, activeSchedules }: Props) {
  const fullName = getEmployeeFullName(employee);
  const initials = getEmployeeInitials(employee);

  const shiftCount = activeSchedules.reduce(
    (total, schedule) => total + schedule.shiftSlots.length,
    0,
  );

  return (
    <header
      className="
        @container overflow-hidden rounded-card border
        border-border bg-surface shadow-card
      "
    >
      <nav
        aria-label="Employee navigation"
        className="border-b border-border px-4 py-3"
      >
        <Link href="/admin/employees" className={ui.dashboardActionLink}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Employees
        </Link>
      </nav>

      <div
        className="
          grid gap-5 p-5
          @md:grid-cols-2
          @5xl:grid-cols-[minmax(16rem,1.35fr)_repeat(4,minmax(0,1fr))]
        "
      >
        <div
          className="
            flex min-w-0 items-center gap-4
            @md:col-span-2 @5xl:col-span-1
          "
        >
          <span
            aria-hidden="true"
            className="
              grid size-14 shrink-0 place-items-center rounded-full
              bg-selected text-base font-semibold text-selected-foreground
            "
          >
            {initials}
          </span>

          <div className="min-w-0">
            <h1 className={`${ui.pageTitle} truncate`}>{fullName}</h1>

            <span
              className={`
                ${ui.badge}
                ${
                  employee.status === "ACTIVE"
                    ? ui.badgeSuccess
                    : ui.badgeNeutral
                }
                mt-2 whitespace-nowrap
              `}
            >
              {employee.status === "ACTIVE" ? "Active employee" : "Disabled"}
            </span>
          </div>
        </div>

        <SummaryDetail
          label="Position"
          value={<PositionBadge position={employee.position} />}
        />

        <SummaryDetail
          label="Departments"
          value={
            <div className="flex flex-wrap gap-1.5">
              {employee.departments.map((department) => {
                const DepartmentIcon = DEPARTMENT_ICONS[department];

                return (
                  <span
                    key={department}
                    className={`
                      ${ui.badge} ${ui.badgeNeutral}
                      gap-1.5 whitespace-nowrap
                    `}
                  >
                    <DepartmentIcon className="size-3.5" aria-hidden="true" />

                    {getDepartmentLabel(department)}
                  </span>
                );
              })}
            </div>
          }
        />

        <SummaryMetric
          value={activeSchedules.length.toString()}
          label={
            activeSchedules.length === 1
              ? "Active schedule"
              : "Active schedules"
          }
        />

        <SummaryMetric
          value={shiftCount.toString()}
          label={shiftCount === 1 ? "Assigned shift" : "Assigned shifts"}
        />
      </div>
    </header>
  );
}

function PositionBadge({ position }: { position: EmployeePosition }) {
  const PositionIcon = EMPLOYEE_POSITION_ICONS[position];

  return (
    <span
      className={`
        ${ui.badge} ${ui.badgeNeutral}
        w-fit gap-1.5 whitespace-nowrap
      `}
    >
      <PositionIcon className="size-3.5" aria-hidden="true" />

      {getPositionLabel(position)}
    </span>
  );
}

function SummaryDetail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0 rounded-control bg-surface-muted p-4">
      <p className={ui.caption}>{label}</p>

      <div className="mt-2">{value}</div>
    </div>
  );
}

function SummaryMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-control bg-surface-muted p-4">
      <div className="flex items-center gap-2 text-foreground-subtle">
        <CalendarCheck2 className="size-4" aria-hidden="true" />

        <p className={ui.caption}>{label}</p>
      </div>

      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}
