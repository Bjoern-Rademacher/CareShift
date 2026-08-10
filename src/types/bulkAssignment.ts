import type { UUID } from "@/types/common";
import type { AssignmentValidationError } from "@/types/scheduling";

export type BulkAssignInput = {
  slotIds: UUID[];
  employeeId: UUID;
  reassignExisting: boolean;
};

export type BulkAssignResult = {
  assignedSlotIds: UUID[];
  skippedSlotIds: UUID[];
};

export type BulkAssignSuccessResponse = {
  ok: true;
  result: BulkAssignResult;
};

export type BulkAssignFailureResponse = {
  ok: false;
  errors: AssignmentValidationError[];
};

export type BulkAssignResponse =
  | BulkAssignSuccessResponse
  | BulkAssignFailureResponse;
