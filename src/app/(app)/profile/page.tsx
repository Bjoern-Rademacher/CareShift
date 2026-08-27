import { notFound, redirect } from "next/navigation";

import { BadgeCheck, Building2, IdCard, Info, UserRound } from "lucide-react";

import * as ui from "@/ui/classes";

import { getCurrentUser } from "@/lib/auth/currentUser";

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

import { getEmployeeProfileData } from "@/lib/useCases/getEmployeeProfileData";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  if (user.role === "DISPLAY") {
    redirect("/dashboard");
  }

  const profile = await getEmployeeProfileData(user);

  if (!profile) {
    notFound();
  }

  const fullName = getEmployeeFullName(profile);
  const initials = getEmployeeInitials(profile);
  const PositionIcon = EMPLOYEE_POSITION_ICONS[profile.position];

  return (
    <div className={`${ui.page} max-w-5xl`}>
      <header>
        <h1 className={ui.pageTitle}>My Profile</h1>

        <p className={`${ui.bodyMuted} mt-1`}>
          Your account and employment information.
        </p>
      </header>

      <section className={ui.dashboardSectionCard}>
        <div className="flex items-center gap-5 px-5 py-6 sm:px-7">
          <span
            aria-hidden="true"
            className="
              grid size-16 shrink-0 place-items-center
              rounded-full bg-selected
              text-xl font-semibold text-selected-foreground
              sm:size-20 sm:text-2xl
            "
          >
            {initials}
          </span>

          <div className="min-w-0">
            <h2
              className="
                truncate text-xl font-semibold
                text-foreground sm:text-2xl
              "
            >
              {fullName}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`${ui.badge} ${ui.badgeNeutral}`}>
                {formatEnumLabel(profile.role)}
              </span>

              <span
                className={`${ui.badge} ${
                  profile.status === "ACTIVE"
                    ? ui.badgeSuccess
                    : ui.badgeNeutral
                }`}
              >
                <span
                  aria-hidden="true"
                  className="mr-1.5 size-1.5 rounded-full bg-current"
                />

                {formatEnumLabel(profile.status)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className={ui.dashboardSectionCard}>
        <header className={ui.dashboardSectionHeader}>
          <div>
            <h2 className={ui.sectionTitle}>Profile Information</h2>

            <p className={ui.caption}>
              Information linked to your employee account.
            </p>
          </div>
        </header>

        <dl className="grid sm:grid-cols-2">
          <ProfileField
            icon={UserRound}
            label="First name"
            value={profile.firstName}
          />

          <ProfileField
            icon={UserRound}
            label="Last name"
            value={profile.lastName}
          />

          <ProfileField
            icon={PositionIcon}
            label="Position"
            value={getPositionLabel(profile.position)}
          />

          <ProfileField
            icon={BadgeCheck}
            label="Account role"
            value={formatEnumLabel(profile.role)}
          />

          <ProfileField
            icon={Building2}
            label="Departments"
            value={
              profile.departments.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {profile.departments.map((department) => {
                    const DepartmentIcon = DEPARTMENT_ICONS[department];

                    return (
                      <span
                        key={department}
                        className={`
                          ${ui.badge} ${ui.badgeNeutral}
                          gap-1.5 whitespace-nowrap
                        `}
                      >
                        <DepartmentIcon
                          className="size-3.5"
                          aria-hidden="true"
                        />

                        {getDepartmentLabel(department)}
                      </span>
                    );
                  })}
                </div>
              ) : (
                "No departments assigned"
              )
            }
          />

          <ProfileField
            icon={IdCard}
            label="Employee ID"
            value={profile.id}
            monospace
          />
        </dl>

        <div className="border-t border-border p-4 sm:p-5">
          <div
            className="
              flex gap-3 rounded-card border border-border
              bg-surface-muted px-4 py-3
            "
          >
            <Info
              className="
                mt-0.5 size-4 shrink-0
                text-foreground-muted
              "
              aria-hidden="true"
            />

            <p className={ui.bodyMuted}>
              Employment details can only be changed by a system administrator.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProfileField({
  icon: Icon,
  label,
  value,
  monospace = false,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  monospace?: boolean;
}) {
  return (
    <div
      className="
        flex min-w-0 gap-3 border-b border-border
        px-5 py-5 last:border-b-0
        odd:sm:border-r sm:px-7
        sm:[&:nth-last-child(-n+2)]:border-b-0
      "
    >
      <span
        className="
          grid size-10 shrink-0 place-items-center
          rounded-control border border-border
          bg-surface-muted text-primary
        "
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>

      <div className="min-w-0">
        <dt className={ui.bodyMuted}>{label}</dt>

        <dd
          className={`
            mt-1 break-words text-sm
            font-medium text-foreground
            ${monospace ? "font-mono text-xs" : ""}
          `}
        >
          {value}
        </dd>
      </div>
    </div>
  );
}

function formatEnumLabel(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
