import type { Departments, UUID } from "@/types/common";
import type { PeriodStatus, ShiftSlot } from "@/types/scheduling";

export type AdminDashboardPeriod = {
  id: UUID;
  department: Departments;
  startDate: Date;
  endDate: Date;
  status: PeriodStatus;
};

export type AdminDashboardCurrentWeekItem =
  | {
      type: "SCHEDULE";
      period: AdminDashboardPeriod;
    }
  | {
      type: "MISSING";
      department: Departments;
      startDate: Date;
      endDate: Date;
    };

export type AdminDashboardAttentionItem =
  | {
      type: "DRAFT";
      period: AdminDashboardPeriod;
    }
  | {
      type: "MISSING";
      department: Departments;
      startDate: Date;
      endDate: Date;
    };

export type AdminDashboardData = {
  summary: {
    needsAttention: number;
    draft: number;
    validated: number;
    published: number;
  };

  currentWeekItems: AdminDashboardCurrentWeekItem[];

  upcomingPeriods: AdminDashboardPeriod[];

  needsAttention: AdminDashboardAttentionItem[];
};

export type EmployeeDashboardPeriod = {
  id: UUID;
  department: Departments;
  startDate: Date;
  endDate: Date;
  assignedShiftCount: number;
};

export type EmployeeDashboardData = {
  currentWeekPeriods: EmployeeDashboardPeriod[];
  currentWeekShiftSlots: ShiftSlot[];
  upcomingPeriods: EmployeeDashboardPeriod[];
};

export type DisplayDashboardPeriod = {
  id: UUID;
  department: Departments;
  startDate: Date;
  endDate: Date;
};

export type DisplayDashboardData = {
  currentWeekPeriods: DisplayDashboardPeriod[];
};
