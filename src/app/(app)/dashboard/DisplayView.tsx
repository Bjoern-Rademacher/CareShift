"use client";

import { useState } from "react";

import { Monitor } from "lucide-react";

import * as ui from "@/ui/classes";

import DashboardScheduleList from "@/app/(app)/dashboard/components/DashboardScheduleList";

import { DEPARTMENT_LABELS } from "@/lib/functions/departments";

import { DEPARTMENTS } from "@/types/common";

import type { Departments } from "@/types/common";
import type { DisplayDashboardData } from "@/types/dashboard";

type Props = {
  data: DisplayDashboardData;
};

type DepartmentFilter = "ALL" | Departments;

const departmentOptions: Array<{
  value: DepartmentFilter;
  label: string;
}> = [
  { value: "ALL", label: "All departments" },
  ...DEPARTMENTS.map((department) => ({
    value: department,
    label: DEPARTMENT_LABELS[department],
  })),
];

export default function DisplayView({ data }: Props) {
  const [department, setDepartment] = useState<DepartmentFilter>("ALL");

  const visiblePeriods = data.currentWeekPeriods.filter(
    (period) => department === "ALL" || period.department === department,
  );

  return (
    <div className={ui.page}>
      <header
        className="
          rounded-card border border-border
          bg-surface p-5 shadow-card
        "
      >
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="
              grid size-11 shrink-0 place-items-center
              rounded-control bg-selected
              text-selected-foreground
            "
          >
            <Monitor className="size-5" />
          </span>

          <div className="min-w-0">
            <h1 className={ui.pageTitle}>Schedule Dashboard</h1>

            <p className={`${ui.bodyMuted} mt-1`}>
              Published schedules for the current week.
            </p>
          </div>
        </div>
      </header>

      <DashboardScheduleList
        title="Current Week"
        description="Select a department to narrow the schedule list."
        periods={visiblePeriods}
        emptyMessage="No published schedules for this department this week."
        getHref={(period) => `/schedules/${period.id}`}
        action={
          <label>
            <span className="sr-only">Filter by department</span>

            <select
              value={department}
              onChange={(event) =>
                setDepartment(event.target.value as DepartmentFilter)
              }
              className={ui.select}
            >
              {departmentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        }
      />
    </div>
  );
}
