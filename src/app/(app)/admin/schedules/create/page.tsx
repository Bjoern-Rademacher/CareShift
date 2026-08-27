"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import * as ui from "@/ui/classes";

import { type Departments, DEPARTMENTS, type UUID } from "@/types/common";
import type { ScheduleErrorCode } from "@/domain/errors/scheduleErrors";

import { scheduleErrorMessages } from "@/domain/errors/scheduleErrors";
import { createSchedule } from "@/lib/api/createSchedule";

type CreateScheduleResponse =
  | {
      ok: true;
      schedule: {
        id: string;
      };
    }
  | {
      ok: false;
      code: ScheduleErrorCode;
      scheduleId: UUID;
    };

function isDepartment(value: string | null): value is Departments {
  return value !== null && DEPARTMENTS.includes(value as Departments);
}

function isDateInputValue(value: string | null): value is string {
  return value !== null && /^\d{4}-\d{2}-\d{2}$/.test(value);
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
  const [targetScheduleId, setTargetScheduleId] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setTargetScheduleId(null);

    try {
      const data = await createSchedule({
        department,
        weekStartDate,
      });

      if (!data.ok) {
        const errorMessage = data.code
          ? (scheduleErrorMessages[data.code] ?? data.error)
          : data.error;

        setMessage(errorMessage);

        if (data.scheduleId) {
          setTargetScheduleId(data.scheduleId);
        }

        return;
      }

      router.push(`/admin/schedules/${data.schedule.id}`);
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
              onChange={(event) =>
                setDepartment(event.target.value as Departments)
              }
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

        {message && <p className={`${ui.errorAlert} mt-6`}>{message}</p>}

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
