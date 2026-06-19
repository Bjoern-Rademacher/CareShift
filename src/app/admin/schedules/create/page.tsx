"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import * as ui from "@/ui/classes";

import type { Departments } from "@/types/common";
import { DEPARTMENTS } from "@/types/common";

type CreateScheduleResponse =
  | {
      ok: true;
      schedule: {
        id: string;
      };
    }
  | {
      ok: false;
      code?: string;
      message?: string;
      error?: string;
      scheduleId?: string;
    };

export default function CreateSchedulePage() {
  const router = useRouter();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [department, setDepartment] = useState<Departments>("ER");
  const [weekStartDate, setWeekStartDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [targetScheduleId, setTargetScheduleId] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setMessage(null);
    setTargetScheduleId(null);

    try {
      const res = await fetch("/api/admin/schedules/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          department,
          weekStartDate,
        }),
      });

      const data = (await res.json()) as CreateScheduleResponse;

      if (!data.ok) {
        setMessage(
          data.message ?? data.error ?? "Schedule could not be created.",
        );

        if (data.scheduleId) {
          setTargetScheduleId(data.scheduleId);
        }

        return;
      }

      setMessage("Schedule created successfully.");
      setTargetScheduleId(data.schedule.id);

      router.push(`/admin/schedules/${data.schedule.id}`);
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
            Open schedule
          </Link>
        )}
      </section>
    </main>
  );
}
