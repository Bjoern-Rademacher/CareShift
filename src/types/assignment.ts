import type { ApiResponse } from "@/types/api";
import type { Departments, UUID } from "@/types/common";
import type { AssignableEmployee, Position } from "@/types/employee";
import type { ShiftSlot } from "@/types/scheduling";

/* Assignment candidate evaluation */

export type AssignmentUnavailableReason =
  | "AT_CAPACITY"
  | "ROLLING_7_DAY_LIMIT"
  | "OVERLAP"
  | "INSUFFICIENT_REST";

export type EmployeeWorkload = {
  assignedHours: number;
  targetHours: number;
  shiftCount: number;
  nightShiftCount: number;
  weekendShiftCount: number;
};

export type NeighborShift = {
  shiftSlot: ShiftSlot;
  restHours: number;
  overlaps: boolean;
  hasEnoughRest: boolean;
};

export type EmployeeAssignmentCandidate = {
  employee: AssignableEmployee;
  workload: EmployeeWorkload;

  previousShift: NeighborShift | null;
  nextShift: NeighborShift | null;

  assignable: boolean;
  unavailableReason: AssignmentUnavailableReason | null;
};

/* Internal assignment data */

export type AssignmentShift = {
  id: UUID;
  periodId: UUID;
  employeeId: UUID | null;

  department: Departments;
  position: Position;
  slotNumber: number;

  startTime: Date;
  endTime: Date;
};

/* API responses */

export type GetAssignmentCandidatesResponse = ApiResponse<
  {
    candidates: EmployeeAssignmentCandidate[];
  },
  "SHIFT_SLOT_NOT_FOUND"
>;
