import { DEPARTMENTS } from "@/types/common";

import type { Departments } from "@/types/common";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isDepartment(value: unknown): value is Departments {
  return (
    typeof value === "string" &&
    DEPARTMENTS.some((department) => department === value)
  );
}
