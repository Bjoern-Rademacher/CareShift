import Link from "next/link";

import { ArrowRight, UserRoundX, Users } from "lucide-react";

import * as ui from "@/ui/classes";

import { getDisplayEmployees } from "@/lib/db/employees";

import {
  DEPARTMENT_ICONS,
  getDepartmentLabel,
} from "@/lib/constants/departmentDisplay";
import {
  getEmployeeFullName,
  getEmployeeInitials,
  getPositionLabel,
} from "@/lib/constants/employeeDisplay";

import type { DisplayEmployee, EmployeeStatus } from "@/types/employee";

type Props = {
  searchParams: Promise<{
    status?: string;
  }>;
};

type EmployeeFilter = "ALL" | EmployeeStatus;

const filterOptions: Array<{
  value: EmployeeFilter;
  label: string;
  href: string;
}> = [
  {
    value: "ALL",
    label: "All",
    href: "/admin/employees?status=all",
  },
  {
    value: "ACTIVE",
    label: "Active",
    href: "/admin/employees",
  },
  {
    value: "DISABLED",
    label: "Disabled",
    href: "/admin/employees?status=disabled",
  },
];

export default async function EmployeesPage({ searchParams }: Props) {
  const params = await searchParams;
  const filter = getEmployeeFilter(params.status);

  const status = filter === "ALL" ? undefined : filter;
  const employees = await getDisplayEmployees(status);

  return (
    <div className={ui.page}>
      <header
        className="
          rounded-card border border-border
          bg-surface p-5 shadow-card
        "
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span
              aria-hidden="true"
              className="
                grid size-11 shrink-0 place-items-center
                rounded-control bg-selected
                text-selected-foreground
              "
            >
              <Users className="size-5" />
            </span>

            <div className="min-w-0">
              <h1 className={ui.pageTitle}>Employees</h1>

              <p className={`${ui.bodyMuted} mt-1`}>
                Staff overview with departments, positions, and status.
              </p>
            </div>
          </div>

          <nav
            aria-label="Employee status"
            className="
              inline-flex rounded-control border
              border-border bg-surface-muted p-1
            "
          >
            {filterOptions.map((option) => {
              const isActive = option.value === filter;

              return (
                <Link
                  key={option.value}
                  href={option.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`${ui.segmentedControlButton} ${
                    isActive
                      ? "bg-selected text-selected-foreground shadow-sm"
                      : `
                        text-foreground-muted
                        hover:bg-surface-hover hover:text-foreground
                      `
                  }`}
                >
                  {option.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {employees.length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {employees.map((employee) => (
            <li key={employee.id}>
              <EmployeeCard employee={employee} />
            </li>
          ))}
        </ul>
      ) : (
        <div
          className="
            rounded-card border border-border bg-surface
            px-4 py-12 text-center shadow-card
          "
        >
          <UserRoundX
            className="mx-auto size-7 text-foreground-subtle"
            aria-hidden="true"
          />

          <p className={`${ui.bodyMuted} mt-3`}>{getEmptyMessage(filter)}</p>
        </div>
      )}
    </div>
  );
}

function EmployeeCard({ employee }: { employee: DisplayEmployee }) {
  const fullName = getEmployeeFullName(employee);
  const initials = getEmployeeInitials(employee);
  const isActive = employee.status === "ACTIVE";

  return (
    <Link
      href={`/admin/employees/${employee.id}`}
      className={`
        group block h-full rounded-card border border-border
        bg-surface p-5 shadow-card
        transition-colors duration-fast
        hover:bg-surface-hover
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-ring
      `}
    >
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className={`
            grid size-14 shrink-0 place-items-center
            rounded-full text-base font-semibold
            ${
              isActive
                ? "bg-selected text-selected-foreground"
                : "bg-surface-muted text-foreground-muted"
            }
          `}
        >
          {initials}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className={`${ui.cardTitle} truncate`}>{fullName}</h2>

            <span
              className={`${ui.badge} ${
                isActive ? ui.badgeSuccess : ui.badgeNeutral
              }`}
            >
              {isActive ? "Active" : "Disabled"}
            </span>
          </div>

          <p className={`${ui.bodyMuted} mt-1`}>
            {getPositionLabel(employee.position)}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
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
        </div>

        <ArrowRight
          className="
            size-4 shrink-0 text-foreground-subtle
            transition-transform group-hover:translate-x-0.5
          "
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}

function getEmployeeFilter(value: string | undefined): EmployeeFilter {
  if (value === "all") {
    return "ALL";
  }

  if (value === "disabled") {
    return "DISABLED";
  }

  return "ACTIVE";
}

function getEmptyMessage(filter: EmployeeFilter): string {
  switch (filter) {
    case "ALL":
      return "No employees were found.";

    case "ACTIVE":
      return "No active employees were found.";

    case "DISABLED":
      return "No disabled employees were found.";
  }
}
