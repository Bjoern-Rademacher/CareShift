import type { Employee } from "@/types/employee";
import type { SchedulePeriod, ShiftSlot } from "@/types/scheduling";

import { mockEmployees } from "@/lib/mock/employees";
import { mockPeriods } from "@/lib/mock/periods";
import { mockShiftSlots } from "@/lib/mock/shiftSlots";

type MockStore = {
  employees: Employee[];
  periods: SchedulePeriod[];
  shiftSlots: ShiftSlot[];
};

export const mockStore: MockStore = {
  employees: mockEmployees,
  periods: mockPeriods,
  shiftSlots: mockShiftSlots,
};
