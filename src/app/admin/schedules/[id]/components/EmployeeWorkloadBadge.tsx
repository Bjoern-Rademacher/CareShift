import * as ui from "@/ui/classes";

import { formatTimeOnly, formatWeekday } from "@/lib/functions/dateTimeUtils";

import { AssignmentUnavailableReason } from "@/types/assignment";

import type {
  EmployeeAssignmentCandidate,
  NeighborShift,
} from "@/types/assignment";

type Props = {
  candidate: EmployeeAssignmentCandidate;
  isSaving: boolean;
  onAssign: () => void;
};

function formatRestHours(restHours: number): string {
  return `${Math.round(restHours)} h`;
}

function renderNeighborShift(label: string, shift: NeighborShift | null) {
  if (!shift) {
    return (
      <div className="flex justify-between text-sm text-slate-400">
        <span>{label}</span>
        <span>—</span>
      </div>
    );
  }

  const icon = shift.hasEnoughRest ? "✓" : "⚠";

  const colorClass = shift.hasEnoughRest
    ? "text-emerald-400"
    : "text-amber-400";

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-400">{label}</span>

      <div className="flex items-center gap-3">
        <span className="text-slate-200">
          {formatWeekday(new Date(shift.shiftSlot.startTime))}{" "}
          {formatTimeOnly(new Date(shift.shiftSlot.startTime))}–
          {formatTimeOnly(new Date(shift.shiftSlot.endTime))}
        </span>

        <span className={colorClass}>
          {icon} {formatRestHours(shift.restHours)}
        </span>
      </div>
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

  function getUnavailableReasonLabel(
    reason: AssignmentUnavailableReason,
  ): string {
    switch (reason) {
      case "AT_CAPACITY":
        return "Weekly hours reached";

      case "OVERLAP":
        return "Shift overlaps";

      case "INSUFFICIENT_REST":
        return "Insufficient rest";
    }
  }

  return (
    <article className="rounded-xl border border-slate-700 bg-slate-900 p-4">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-100">
            {employee.firstName} {employee.lastName}
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            {employee.position} • {employee.departments.join(", ")}
          </p>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-200">
                {workload.assignedHours} / {workload.targetHours} h
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-violet-500 transition-all"
                style={{
                  width: `${workloadPercentage}%`,
                }}
              />
            </div>

            <div className="mt-2 flex gap-4 text-xs text-slate-400">
              <span>{workload.shiftCount} shifts</span>

              <span>🌙 {workload.nightShiftCount}</span>

              <span>🏖 {workload.weekendShiftCount}</span>
            </div>
          </div>

          <div className="mt-4 space-y-2 border-t border-slate-800 pt-3">
            {renderNeighborShift("Prev", previousShift)}

            {renderNeighborShift("Next", nextShift)}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <button
            type="button"
            disabled={isSaving || !candidate.assignable}
            className={
              isSaving || !candidate.assignable
                ? "cursor-not-allowed rounded-md bg-slate-800 px-4 py-2 text-slate-500"
                : ui.buttonPrimary
            }
            onClick={onAssign}
          >
            {isSaving ? "Assigning..." : "Assign"}
          </button>

          {!assignable && unavailableReason && (
            <p className="max-w-28 text-right text-xs text-amber-400">
              {getUnavailableReasonLabel(unavailableReason)}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
