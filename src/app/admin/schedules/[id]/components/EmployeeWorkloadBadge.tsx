import * as ui from "@/ui/classes";

import { formatTimeOnly, formatWeekday } from "@/lib/functions/dateTimeUtils";

import type {
  AssignmentUnavailableReason,
  EmployeeAssignmentCandidate,
  NeighborShift,
} from "@/types/assignment";

type Props = {
  candidate: EmployeeAssignmentCandidate;
  isSaving: boolean;
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
      return "Exceeds 40h in a 7-day period";
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
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-500">No nearby shift</span>
        <span />
      </div>
    );
  }

  const shift = neighbor.shiftSlot;

  const statusClass = neighbor.hasEnoughRest
    ? "text-emerald-400"
    : "text-amber-400";

  return (
    <div className="grid grid-cols-[36px_1fr_auto] items-center gap-2 text-xs">
      <span className="text-slate-500">{label}</span>

      <span className="whitespace-nowrap text-slate-300">
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
  isSaving,
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

  return (
    <article className="grid grid-cols-[1.05fr_1fr_1.6fr_auto] items-center gap-5 rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-3">
      {/* Employee */}
      <div className="min-w-0">
        <p className="truncate font-semibold text-slate-100">
          {employee.firstName} {employee.lastName}
        </p>

        <p className="mt-0.5 truncate text-xs text-slate-400">
          {employee.position} • {employee.departments.join(", ")}
        </p>
      </div>

      {/* Workload */}
      <div className="min-w-0">
        <p className="text-sm text-slate-200">
          {workload.assignedHours} / {workload.targetHours} h
        </p>

        <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-slate-500"
            style={{
              width: `${workloadPercentage}%`,
            }}
          />
        </div>

        <p className="mt-1.5 whitespace-nowrap text-xs text-slate-500">
          {workload.shiftCount} shifts
          <span className="mx-2">•</span>☾ {workload.nightShiftCount}
          <span className="mx-2">•</span>◇ {workload.weekendShiftCount}
        </p>
      </div>

      {/* Neighboring shifts */}
      <div className="space-y-1.5 border-l border-slate-800 pl-5">
        <NeighborRow label="Prev" neighbor={previousShift} />
        <NeighborRow label="Next" neighbor={nextShift} />
      </div>

      {/* Action */}
      <div className="flex min-w-28 flex-col items-end gap-1.5">
        <button
          type="button"
          className={
            assignable && !isSaving
              ? ui.buttonPrimary
              : "cursor-not-allowed rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-500"
          }
          disabled={!assignable || isSaving}
          onClick={onAssign}
        >
          {isSaving ? "Saving..." : "Assign"}
        </button>

        {!assignable && unavailableReason && (
          <span className="whitespace-nowrap text-xs text-amber-400">
            {getUnavailableReasonLabel(unavailableReason)}
          </span>
        )}
      </div>
    </article>
  );
}
