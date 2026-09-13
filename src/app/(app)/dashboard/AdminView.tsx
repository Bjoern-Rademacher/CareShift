import Link from "next/link";

import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Clock3,
  FilePenLine,
  LayoutDashboard,
} from "lucide-react";

import * as ui from "@/ui/classes";

import CreateScheduleButton from "@/lib/components/CreateScheduleButton";
import ScheduleStatusBadge from "@/lib/components/ScheduleStatusBadge";

import { getDepartmentLabel } from "@/lib/functions/departments";
import {
  formatSchedulePeriodRange,
  getISOWeekNumber,
} from "@/lib/functions/dateTimeUtils";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { Departments } from "@/types/common";
import type {
  AdminDashboardAttentionItem,
  AdminDashboardCurrentWeekItem,
  AdminDashboardData,
  AdminDashboardPeriod,
} from "@/types/dashboard";
import type { PeriodStatus } from "@/types/scheduling";

type Props = {
  data: AdminDashboardData;
};

const dashboardRowClass = `
  grid grid-cols-3 items-center gap-4
  border-b border-border px-4 py-3
  last:border-b-0
`;

function DashboardSection({
  title,
  description,
  icon: Icon,
  action,
  inset = true,
  children,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: ReactNode;
  inset?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={ui.dashboardSectionCard}>
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-control bg-selected text-selected-foreground"
          >
            <Icon className="size-5" />
          </span>

          <div className="min-w-0">
            <h2 className={ui.sectionTitle}>{title}</h2>

            <p className={ui.caption}>{description}</p>
          </div>
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className="bg-surface-muted p-4">
        {inset ? (
          <div className="overflow-hidden rounded-card border border-border border-l-2 border-l-primary bg-surface">
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <div className={ui.card}>
      <div className="flex items-center gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-control bg-surface-muted text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </div>

        <div>
          <p className={ui.bodyMuted}>{label}</p>

          <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function ViewAllSchedulesLink() {
  return (
    <Link href="/admin/schedules" className={ui.dashboardActionLink}>
      View all
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  );
}

function SchedulePeriodRow({ period }: { period: AdminDashboardPeriod }) {
  return (
    <Link
      href={`/admin/schedules/${period.id}`}
      className={`
        ${dashboardRowClass}
        transition-colors duration-fast
        hover:bg-surface-hover
      `}
    >
      <div className="min-w-0 justify-self-start">
        <p className={ui.label}>{getDepartmentLabel(period.department)}</p>

        <p className={ui.caption}>Week {getISOWeekNumber(period.startDate)}</p>
      </div>

      <p
        className={`${ui.bodyMuted} justify-self-center whitespace-nowrap text-center`}
      >
        {formatSchedulePeriodRange(period.startDate, period.endDate)}
      </p>

      <div className="flex items-center justify-self-end gap-3">
        <ScheduleStatusBadge status={period.status} />

        <ArrowRight
          className="size-4 shrink-0 text-foreground-subtle"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}

function MissingScheduleRow({
  department,
  startDate,
  endDate,
}: {
  department: Departments;
  startDate: Date;
  endDate: Date;
}) {
  return (
    <div className={dashboardRowClass}>
      <div className="min-w-0 justify-self-start">
        <p className={ui.label}>{getDepartmentLabel(department)}</p>

        <p className={ui.caption}>Week {getISOWeekNumber(startDate)}</p>
      </div>

      <p
        className={`${ui.bodyMuted} justify-self-center whitespace-nowrap text-center`}
      >
        {formatSchedulePeriodRange(startDate, endDate)}
      </p>

      <div className="justify-self-end">
        <CreateScheduleButton
          size="compact"
          department={department}
          weekStart={startDate}
        />
      </div>
    </div>
  );
}

function CurrentWeekItem({ item }: { item: AdminDashboardCurrentWeekItem }) {
  if (item.type === "MISSING") {
    return (
      <MissingScheduleRow
        department={item.department}
        startDate={item.startDate}
        endDate={item.endDate}
      />
    );
  }

  return <SchedulePeriodRow period={item.period} />;
}

function AttentionItem({ item }: { item: AdminDashboardAttentionItem }) {
  if (item.type === "MISSING") {
    return (
      <MissingScheduleRow
        department={item.department}
        startDate={item.startDate}
        endDate={item.endDate}
      />
    );
  }

  return <SchedulePeriodRow period={item.period} />;
}

function EmptyAttentionState() {
  return (
    <div className="flex items-center gap-3 px-4 py-6">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-control bg-success-muted text-success">
        <CheckCircle2 className="size-4" aria-hidden="true" />
      </div>

      <div>
        <p className={ui.label}>Nothing needs attention</p>

        <p className={ui.caption}>
          All expected schedules have progressed beyond draft.
        </p>
      </div>
    </div>
  );
}

export default function AdminView({ data }: Props) {
  const { summary, currentWeekItems, upcomingPeriods, needsAttention } = data;

  return (
    <div className={ui.page}>
      <header className="rounded-card border border-border bg-surface p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-control bg-selected text-selected-foreground"
            >
              <LayoutDashboard className="size-5" />
            </span>

            <div className="min-w-0">
              <h1 className={ui.pageTitle}>Admin Dashboard</h1>

              <p className={`${ui.bodyMuted} mt-1`}>
                Overview of active and upcoming schedules.
              </p>
            </div>
          </div>

          <CreateScheduleButton />
        </div>
      </header>

      <DashboardSection
        title="Next 3 Weeks"
        description="Planning status for the following three weeks."
        icon={CalendarDays}
        inset={false}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Needs attention"
            value={summary.needsAttention}
            icon={CircleDashed}
          />

          <SummaryCard label="Draft" value={summary.draft} icon={FilePenLine} />

          <SummaryCard
            label="Validated"
            value={summary.validated}
            icon={CheckCircle2}
          />

          <SummaryCard
            label="Published"
            value={summary.published}
            icon={CalendarDays}
          />
        </div>
      </DashboardSection>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <DashboardSection
            title="Current Week"
            description="One schedule is expected for every department."
            icon={CalendarClock}
          >
            <div className="overflow-x-auto">
              <div className="min-w-[720px]">
                {currentWeekItems.map((item) => (
                  <CurrentWeekItem
                    key={
                      item.type === "SCHEDULE"
                        ? item.period.id
                        : `${item.department}-${item.startDate.toISOString()}`
                    }
                    item={item}
                  />
                ))}
              </div>
            </div>
          </DashboardSection>

          <DashboardSection
            title="Upcoming Schedules"
            description="Existing schedules for the next three weeks."
            icon={CalendarDays}
            action={<ViewAllSchedulesLink />}
          >
            {upcomingPeriods.length > 0 ? (
              <div className="max-h-[520px] overflow-auto">
                <div className="min-w-[720px]">
                  {upcomingPeriods.map((period) => (
                    <SchedulePeriodRow key={period.id} period={period} />
                  ))}
                </div>
              </div>
            ) : (
              <div className={ui.dashboardEmptyState}>
                <CalendarDays
                  className="mx-auto size-6 text-foreground-subtle"
                  aria-hidden="true"
                />

                <p className={`${ui.bodyMuted} mt-2`}>
                  No upcoming schedules have been created yet.
                </p>
              </div>
            )}
          </DashboardSection>

          <DashboardSection
            title="Needs Attention"
            description="Missing or draft schedules for the next three weeks."
            icon={AlertCircle}
            action={<ViewAllSchedulesLink />}
          >
            {needsAttention.length > 0 ? (
              <div className="max-h-[520px] overflow-auto">
                <div className="min-w-[720px]">
                  {needsAttention.map((item) => (
                    <AttentionItem
                      key={
                        item.type === "DRAFT"
                          ? item.period.id
                          : `${item.department}-${item.startDate.toISOString()}-${item.endDate.toISOString()}`
                      }
                      item={item}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <EmptyAttentionState />
            )}
          </DashboardSection>
        </div>

        <DashboardSection
          title="Recent Activity"
          description="Operational history"
          icon={Clock3}
        >
          <div className="flex min-h-[340px] flex-col items-center justify-center px-8 py-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-surface-muted text-primary">
              <Clock3 className="size-6" aria-hidden="true" />
            </div>

            <h3 className={`${ui.cardTitle} mt-5`}>
              Activity tracking is planned for V1.1
            </h3>

            <p className={`${ui.bodyMuted} mt-2 max-w-xs`}>
              Schedule creation, assignments, autofill changes, validation and
              publication events will appear here.
            </p>
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}
