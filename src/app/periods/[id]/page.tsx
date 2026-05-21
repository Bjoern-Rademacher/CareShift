import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/auth/currentUser";

import * as ui from "@/ui/classes";

import SlotsClient from "@/app/periods/[id]/SlotsClient";

import { PeriodsResponse, ShiftSlotsResponseDto } from "@/types/scheduling";
import { EmployeesResponse } from "@/types/employee";

// import getData from "@/functions/fetchData";

import { mockEmployees } from "@/lib/mock/employees";
import { mockPeriods } from "@/lib/mock/periods";
import { mockShiftSlots } from "@/lib/mock/shiftSlots";

export default async function PeriodsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const currentUser = await getCurrentUser();
  const canAssign = currentUser?.role === "admin";

  /* 
  const [periodsResponse, shiftSlotsResponse, employeesResponse] =
 
  await Promise.all([
      getData<PeriodsResponse>("/api/mockPeriods"),
      getData<ShiftSlotsResponseDto>("/api/mockShiftSlots"),
      getData<EmployeesResponse>("/api/mockEmployees"),
    ]); 
  */

  const periodsResponse: PeriodsResponse = {
    periods: mockPeriods,
  };

  const shiftSlotsResponse: ShiftSlotsResponseDto = {
    shiftSlots: mockShiftSlots,
  };

  const employeesResponse: EmployeesResponse = {
    employees: mockEmployees,
  };

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
        <SlotsClient
          periodId={id}
          initialShiftSlots={shiftSlots}
          employees={employees}
          canAssign={canAssign}
        />
        <Link className={ui.button} href="/periods">
          Back to periods
        </Link>
      </section>
    </main>
  );
}
