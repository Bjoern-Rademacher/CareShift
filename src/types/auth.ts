import type { UUID } from "@/types/common";
import type { Departments } from "@/types/common";

export type Role = "ADMIN" | "EMPLOYEE" | "DISPLAY";

export const DEMO_AUTH_SUBJECTS = [
  "demo-admin",
  "demo-employee",
  "demo-display",
] as const;

export type DemoAuthSubject = (typeof DEMO_AUTH_SUBJECTS)[number];

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

export function isDemoAuthSubject(value: unknown): value is DemoAuthSubject {
  return (
    value === "demo-admin" ||
    value === "demo-employee" ||
    value === "demo-display"
  );
}
