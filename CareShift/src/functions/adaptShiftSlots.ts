import { ShiftSlotsResponseDto, ShiftSlot } from "@/types/scheduling";

export default function adaptShiftSlots(
  response: ShiftSlotsResponseDto,
): ShiftSlot[] {
  return response.shiftSlots;
}
