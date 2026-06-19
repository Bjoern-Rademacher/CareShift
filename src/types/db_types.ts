import type { Department, Position } from "@/generated/prisma/client";

export type CreateShiftSlotInput = {
  department: Department;
  position: Position;
  startTime: Date;
  endTime: Date;
};

export type CreateSchedulePeriodInput = {
  department: Department;
  startDate: Date;
  endDate: Date;
};
