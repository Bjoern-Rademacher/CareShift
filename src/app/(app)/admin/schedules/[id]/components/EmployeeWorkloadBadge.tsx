import * as ui from "@/ui/classes";

import { formatTimeOnly, formatWeekday } from "@/lib/functions/dateTimeUtils";
import { getPositionLabel } from "@/lib/functions/employeePositions";

import type {
  AssignmentUnavailableReason,
  EmployeeAssignmentCandidate,
  NeighborShift,
} from "@/types/assignment";
import type { UUID } from "@/types/common";

type Props = {
  candidate: EmployeeAssignmentCandidate;
  savingEmployeeId: UUID | null;
  onAssign: () => void;
};

function getUnavailableReasonLabel(
  reason: AssignmentUnavailableReason,
): string {
  switch (reason) {
    case "AT_CAPACITY":
      return "Weekly hours reached";
    case "OVERLAP":
      return "Overlapping shift";
    case "INSUFFICIENT_REST":
      return "Insufficient rest";
    case "ROLLING_7_DAY_LIMIT":
      return "Exceeds 40h in 7 days";
  }
}

function formatRestHours(hours: number): string {
  return `${Math.max(0, Math.round(hours))}h`;
}

function NeighborRow({
  label,
  neighbor,
}: {
  label: "Prev" | "Next";
  neighbor: NeighborShift | null;
}) {
  if (!neighbor) {
    return (
      <div className="grid grid-cols-[36px_1fr_auto] items-center gap-2 text-xs">
        <span className="text-foreground-subtle">{label}</span>
        <span className="text-foreground-subtle">No nearby shift</span>
        <span />
      </div>
    );
  }

  const shift = neighbor.shiftSlot;
  const statusClass = neighbor.hasEnoughRest ? "text-success" : "text-warning";

  return (
    <div className="grid grid-cols-[36px_1fr_auto] items-center gap-2 text-xs">
      <span className="text-foreground-subtle">{label}</span>

      <span className="whitespace-nowrap text-foreground-muted">
        {formatWeekday(new Date(shift.startTime))}{" "}
        {formatTimeOnly(new Date(shift.startTime))}–
        {formatTimeOnly(new Date(shift.endTime))}
      </span>

      <span className={`whitespace-nowrap ${statusClass}`}>
        {neighbor.hasEnoughRest ? "✓" : "⚠"}{" "}
        {formatRestHours(neighbor.restHours)}
      </span>
    </div>
  );
}

export default function EmployeeWorkloadBadge({
  candidate,
  savingEmployeeId,
  onAssign,
}: Props) {
  const {
    employee,
    workload,
    previousShift,
    nextShift,
    assignable,
    unavailableReason,
  } = candidate;

  const workloadPercentage = Math.min(
    (workload.assignedHours / workload.targetHours) * 100,
    100,
  );

  const isSaving = savingEmployeeId === employee.id;
  const assignmentLocked = savingEmployeeId !== null;

  return (
    <article className="grid grid-cols-[1.05fr_1fr_1.6fr_auto] items-center gap-5 rounded-card border border-border bg-surface-muted px-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-semibold text-foreground">
          {employee.firstName} {employee.lastName}
        </p>

        <p className="mt-0.5 truncate text-xs text-foreground-muted">
          {getPositionLabel(employee.position)} •{" "}
          {employee.departments.join(", ")}
        </p>
      </div>

      <div className="min-w-0">
        <p className="text-sm text-foreground">
          {workload.assignedHours} / {workload.targetHours} h
        </p>

        <div
          role="progressbar"
          aria-label={`${employee.firstName} ${employee.lastName} workload`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(workloadPercentage)}
          className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-border"
        >
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${workloadPercentage}%` }}
          />
        </div>

        <p className="mt-1.5 whitespace-nowrap text-xs text-foreground-subtle">
          {workload.shiftCount} shifts
          <span className="mx-2">•</span>☾ {workload.nightShiftCount}
          <span className="mx-2">•</span>◇ {workload.weekendShiftCount}
        </p>
      </div>

      <div className="space-y-1.5 border-l border-border pl-5">
        <NeighborRow label="Prev" neighbor={previousShift} />
        <NeighborRow label="Next" neighbor={nextShift} />
      </div>

      <div className="flex min-w-28 flex-col items-end gap-1.5">
        <button
          type="button"
          className={
            assignable
              ? `${ui.buttonPrimary} disabled:cursor-wait disabled:opacity-60`
              : "cursor-not-allowed rounded-control border border-border bg-surface px-3 py-1.5 text-sm text-foreground-subtle"
          }
          disabled={!assignable || assignmentLocked}
          onClick={onAssign}
        >
          {isSaving ? "Saving…" : "Assign"}
        </button>

        {!assignable && unavailableReason && (
          <span className="whitespace-nowrap text-xs text-warning">
            {getUnavailableReasonLabel(unavailableReason)}
          </span>
        )}
      </div>
    </article>
  );
}
