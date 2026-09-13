"use client";

import { useRef, useState } from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import * as ui from "@/ui/classes";

import { createSchedule } from "@/lib/api/createSchedule";
import { parseDateOnly } from "@/lib/functions/dateTimeUtils";
import { isDepartment } from "@/lib/validation/common";

import { DEPARTMENTS } from "@/types/common";

import type { FormEvent } from "react";
import type { Departments, UUID } from "@/types/common";

function isDateInputValue(value: string | null): value is string {
  return value !== null && parseDateOnly(value) !== null;
}

export default function CreateSchedulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const dateInputRef = useRef<HTMLInputElement>(null);

  const departmentParam = searchParams.get("department");
  const weekStartParam = searchParams.get("weekStart");

  const [department, setDepartment] = useState<Departments>(
    isDepartment(departmentParam) ? departmentParam : "ER",
  );

  const [weekStartDate, setWeekStartDate] = useState(
    isDateInputValue(weekStartParam) ? weekStartParam : "",
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [targetScheduleId, setTargetScheduleId] = useState<UUID | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setTargetScheduleId(null);

    try {
      const result = await createSchedule({
        department,
        weekStartDate,
      });

      if (!result.ok) {
        setMessage(result.error.message);

        if (result.error.code === "SCHEDULE_ALREADY_EXISTS") {
          setTargetScheduleId(result.error.details?.scheduleId ?? null);
        }

        return;
      }

      router.push(`/admin/schedules/${result.data.schedule.id}`);
    } catch {
      setMessage("The schedule could not be created. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={ui.page}>
      <section className={`${ui.section} ${ui.card}`}>
        <h1 className={ui.title}>Create Schedule</h1>

        <p className={ui.subtitle}>
          Select a department and week to generate a draft schedule.
        </p>

        <form className="mt-6" onSubmit={handleSubmit}>
          <label className="block">
            <span>Department</span>

            <select
              className={ui.input}
              value={department}
              onChange={(event) => {
                const value = event.target.value;

                if (isDepartment(value)) {
                  setDepartment(value);
                }
              }}
            >
              {DEPARTMENTS.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 block">
            <span>Week start date</span>

            <input
              ref={dateInputRef}
              className={ui.input}
              type="date"
              value={weekStartDate}
              onClick={() => dateInputRef.current?.showPicker?.()}
              onChange={(event) => setWeekStartDate(event.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            className={`${ui.button} mt-6`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create schedule"}
          </button>
        </form>

        {message && (
          <p role="alert" className={`${ui.errorAlert} mt-6`}>
            {message}
          </p>
        )}

        {targetScheduleId && (
          <Link
            className={`${ui.button} mt-4`}
            href={`/admin/schedules/${targetScheduleId}`}
          >
            Go to schedule
          </Link>
        )}
      </section>
    </main>
  );
}
