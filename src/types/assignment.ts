import type { AssignableEmployee } from "@/types/employee";
import type { ShiftSlot } from "@/types/scheduling";

import type { UUID } from "@/types/common";

import type { Departments } from "@/types/common";
import type { Position } from "@/types/employee";

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
