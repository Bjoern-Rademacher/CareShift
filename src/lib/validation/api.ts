import type { ApiIssue, CommonApiErrorCode } from "@/types/api";
import { isRecord } from "@/lib/validation/common";

export function isCommonApiErrorCode(value: unknown): value is CommonApiErrorCode {
  return (
    value === "INVALID_JSON" ||
    value === "INVALID_INPUT" ||
    value === "UNAUTHENTICATED" ||
    value === "FORBIDDEN" ||
    value === "NOT_FOUND" ||
    value === "INTERNAL_ERROR"
  );
}

export function isApiIssue(value: unknown): value is ApiIssue {
  return (
    isRecord(value) &&
    typeof value.code === "string" &&
    typeof value.message === "string" &&
    (value.field === undefined || typeof value.field === "string")
  );
}
