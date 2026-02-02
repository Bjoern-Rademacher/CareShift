import { notFound } from "next/navigation";
import Link from "next/link";

import * as ui from "@/app/periods/uiCLasses";

import SlotsClient from "@/app/periods/[id]/SlotsCliet";

import { PeriodsResponse, ShiftSlotsResponseDto } from "@/types/scheduling";
import { EmployeesResponse } from "@/types/employee";

import getData from "@/functions/fetchData";

export default async function PeriodsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [periodsResponse, shiftSlotsResponse, employeesResponse] =
    await Promise.all([
      getData<PeriodsResponse>(
        "https://mockfast.io/backend/apitemplate/get/888213805131320/periods",
      ),
      getData<ShiftSlotsResponseDto>(
        "https://mockfast.io/backend/apitemplate/get/888213805131320/shift-slots",
      ),
      getData<EmployeesResponse>(
        "https://mockfast.io/backend/apitemplate/get/888213805131320/employee",
      ),
    ]);

  const period = periodsResponse.periods.find((p) => p.id === id);
  if (!period) {
    notFound();
  }

  const allSlots = shiftSlotsResponse.shiftSlots;
  const shiftSlots = allSlots.filter((s) => {
    return s.periodId === id;
  });

  const { employees } = employeesResponse;

  return (
    <main className={ui.page}>
      <section className={ui.section}>
        <h2 className={ui.title}>Department: {period.department}</h2>
        <p className={ui.subtitle}>Start Date: {period.startDate}</p>
        <p className={ui.subtitle}>Period ID: {period.id}</p>
        <p className={ui.subtitle}>Status: {period.status}</p>
        <SlotsClient initialShiftSlots={shiftSlots} employees={employees} />
        <Link className={ui.button} href="/periods">
          Back to periods
        </Link>
      </section>
    </main>
  );
}
