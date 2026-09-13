import type { UUID } from "@/types/common";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUUID(value: unknown): value is UUID {
  return typeof value === "string" && UUID_PATTERN.test(value);
}
