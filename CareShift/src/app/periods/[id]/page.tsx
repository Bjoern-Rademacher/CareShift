import { notFound } from "next/navigation";
import Link from "next/link";

import { PeriodsResponse, ShiftSlotsResponseDto } from "@/types/scheduling";

import getData from "@/functions/fetchData";
import adaptShiftSlots from "@/functions/adaptShiftSlots";

import SlotsTable from "@/app/periods/[id]/SlotsTable";

export default async function PeriodsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const periodsData = await getData<PeriodsResponse>(
    "https://mockfast.io/backend/apitemplate/get/888213805131320/periods",
  );
  const shiftSlotsResponse = await getData<ShiftSlotsResponseDto>(
    "https://mockfast.io/backend/apitemplate/get/888213805131320/shift-slots",
  );

  const allSlots = adaptShiftSlots(shiftSlotsResponse);
  const shiftSlots = allSlots.filter((s) => {
    return s.periodId === id;
  });

  const period = periodsData.periods.find((p) => p.id === id);

  if (!period) {
    notFound();
  }

  return (
    <main>
      <section>
        <h2>Department: {period.department}</h2>
        <p>Start Date: {period.startDate}</p>
        <p>Period ID: {period.id}</p>
        <p>Status: {period.status}</p>
        <SlotsTable shiftSlots={shiftSlots} />
        <Link href="/periods">Back to periods</Link>
      </section>
    </main>
  );
}
