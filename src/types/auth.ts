import type { UUID } from "@/types/common";
import type { Departments } from "@/types/common";

export type Role = "ADMIN" | "EMPLOYEE" | "DISPLAY";

type StaffUser = {
  firstName: string;
  lastName: string;
  employeeId: UUID;
  department?: Departments;
};

export type CurrentUser =
  | (StaffUser & {
      role: "ADMIN";
    })
  | (StaffUser & {
      role: "EMPLOYEE";
    })
  | {
      role: "DISPLAY";
      firstName: string;
      lastName: string;
      employeeId?: never;
      department?: never;
    };

export const DEMO_USERS: Record<Role, CurrentUser> = {
  ADMIN: {
    role: "ADMIN",
    firstName: "Anna",
    lastName: "Keller",
    employeeId: "057778a3-ed8f-4fcf-bbcf-a6852e1bd2ba" as UUID,
  },

  EMPLOYEE: {
    role: "EMPLOYEE",
    firstName: "Kevin",
    lastName: "Frank",
    employeeId: "342d14d3-2e2b-4bf6-9cd8-f77eda989f34" as UUID,
    department: "ER",
  },

  DISPLAY: {
    role: "DISPLAY",
    firstName: "Display",
    lastName: "Operator",
  },
};

export function isValidRole(value: unknown): value is Role {
  return value === "ADMIN" || value === "EMPLOYEE" || value === "DISPLAY";
}
