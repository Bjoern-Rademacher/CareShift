import Link from "next/link";

import { ArrowRight, CalendarDays } from "lucide-react";

import * as ui from "@/ui/classes";

import { getDepartmentLabel } from "@/lib/functions/departments";
import {
  formatSchedulePeriodRange,
  getISOWeekNumber,
} from "@/lib/functions/dateTimeUtils";

import type { ReactNode } from "react";
import type { Departments } from "@/types/common";

type DashboardSchedulePeriod = {
  id: string;
  department: Departments;
  startDate: Date;
  endDate: Date;
};

type Props<Period extends DashboardSchedulePeriod> = {
  title: string;
  description?: string;
  periods: readonly Period[];
  emptyMessage: string;
  getHref: (period: Period) => string;
  renderTrailing?: (period: Period) => ReactNode;
  action?: ReactNode;
  listClassName?: string;
  footer?: ReactNode;
};

export default function DashboardScheduleList<
  Period extends DashboardSchedulePeriod,
>({
  title,
  description,
  periods,
  emptyMessage,
  getHref,
  renderTrailing,
  action,
  listClassName,
  footer,
}: Props<Period>) {
  return (
    <section className={ui.dashboardSectionCard}>
      <div className={`${ui.dashboardSectionHeader} justify-between gap-4`}>
        <div className="min-w-0">
          <h2 className={ui.sectionTitle}>{title}</h2>

          {description && <p className={ui.caption}>{description}</p>}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>

      {periods.length > 0 ? (
        <>
          <div className={listClassName}>
            {periods.map((period) => (
              <ScheduleRow
                key={period.id}
                period={period}
                href={getHref(period)}
                trailing={renderTrailing?.(period)}
              />
            ))}
          </div>

          {footer && (
            <div className="border-t border-border bg-surface-muted p-4">
              {footer}
            </div>
          )}
        </>
      ) : (
        <EmptyState message={emptyMessage} />
      )}
    </section>
  );
}

function ScheduleRow({
  period,
  href,
  trailing,
}: {
  period: DashboardSchedulePeriod;
  href: string;
  trailing?: ReactNode;
}) {
  return (
    <Link href={href} className={ui.dashboardScheduleRow}>
      <div className="min-w-0">
        <p className={ui.label}>{getDepartmentLabel(period.department)}</p>

        <p className={ui.caption}>Week {getISOWeekNumber(period.startDate)}</p>
      </div>

      <p className={ui.dashboardScheduleDate}>
        {formatSchedulePeriodRange(period.startDate, period.endDate)}
      </p>

      <div className="ml-auto flex shrink-0 items-center gap-3">
        {trailing}

        <ArrowRight
          className="size-4 shrink-0 text-foreground-subtle"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className={ui.dashboardEmptyState}>
      <CalendarDays
        className="mx-auto size-6 text-foreground-subtle"
        aria-hidden="true"
      />

      <p className={`${ui.bodyMuted} mt-2`}>{message}</p>
    </div>
  );
}
