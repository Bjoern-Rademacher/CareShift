import type { Employee } from "@/types/employee";
import type { Schedule, ShiftSlot, TemplateRule } from "@/types/scheduling";

import { mockEmployees } from "@/lib/mock/employees";
import { mockPeriods } from "@/lib/mock/periods";
import { mockShiftSlots } from "@/lib/mock/shiftSlots";
import { mockTemplateRules } from "./templateRules";

type MockStore = {
  employees: Employee[];
  periods: Schedule[];
  shiftSlots: ShiftSlot[];
  templateRules: TemplateRule[];
};

export const mockStore: MockStore = {
  employees: mockEmployees,
  periods: mockPeriods,
  shiftSlots: mockShiftSlots,
  templateRules: mockTemplateRules,
};
