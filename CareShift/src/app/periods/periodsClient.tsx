"use client";
import { useState } from "react";
import Link from "next/link";

import * as ui from "@/app/periods/uiCLasses";

import type { SchedulePeriod } from "@/types/scheduling";
import type { Departments } from "@/types/common";
import { DEPARTMENTS } from "@/types/common";

type Props = Readonly<{
  periods: SchedulePeriod[];
}>;

function formatDateOnly(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  let day = d.getDay();

  if (day === 0) {
    day = 7;
  }

  const diff = day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(12, 0, 0, 0);

  return d;
}

function parseDateOnly(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// mit dem Montag können wir die periods auswählen

export default function PeriodsClient({ periods }: Props) {
  const [selectedDepartment, setSelectedDepartment] =
    useState<Departments>("ER");

  const [selectedMonday, setSelectedMonday] = useState<string>(() =>
    formatDateOnly(getMonday(new Date())),
  );

  const filteredPeriods = periods.filter(
    (p) =>
      p.department === selectedDepartment &&
      p.startDate.slice(0, 10) === selectedMonday,
  );

  function changeMonday(direction: "previous" | "next") {
    const delta = direction === "previous" ? -7 : 7;
    const date = parseDateOnly(selectedMonday);

    date.setDate(date.getDate() + delta);
    date.setHours(12, 0, 0, 0);

    setSelectedMonday(formatDateOnly(date));
  }

  return (
    <section className="flex flex-col items-center gap-6">
      <h1 className={ui.title}>Periods</h1>
      <h2 className={ui.subtitle}>Select department and week</h2>
      <select
        className={ui.select}
        value={selectedDepartment}
        onChange={(e) => setSelectedDepartment(e.target.value as Departments)}
      >
        {DEPARTMENTS.map((dept) => (
          <option key={dept} value={dept}>
            {dept}
          </option>
        ))}
      </select>
      <div className="space-x-5">
        <button className={ui.button} onClick={() => changeMonday("previous")}>
          PREVIOUS
        </button>
        <input
          className={ui.inputCompact}
          type="date"
          value={selectedMonday}
          onChange={(e) => {
            const picked = parseDateOnly(e.target.value);
            const monday = getMonday(picked);
            setSelectedMonday(formatDateOnly(monday));
            //  console.log(selectedMonday);
          }}
        />
        <button className={ui.button} onClick={() => changeMonday("next")}>
          NEXT
        </button>
      </div>
      <p className={ui.subtitle}>
        selected week is <strong>{selectedMonday}</strong>
      </p>
      <ul className="w-full max-w-[60%] mx-auto space-y-3">
        {filteredPeriods.length === 0 ? (
          <li className={ui.card}>No data for this week</li>
        ) : (
          filteredPeriods.map((p) => (
            <li className={ui.card} key={p.id}>
              <span>{p.startDate}</span>
              <br />
              <Link className={ui.buttonGhost} href={`/periods/${p.id}`}>
                Show details
              </Link>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
