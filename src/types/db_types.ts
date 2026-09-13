import type { Department, Position } from "@/generated/prisma/client";

export type CreateShiftSlotInput = {
  department: Department;
  position: Position;
  slotNumber: number;
  startTime: Date;
  endTime: Date;
};

export type CreateSchedulePeriodInput = {
  department: Department;
  startDate: Date;
  endDate: Date;
};
