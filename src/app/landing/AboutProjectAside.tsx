"use client";

import { useEffect } from "react";

import { ArrowUpRight, Check, FileText, X } from "lucide-react";
import { siGithub } from "simple-icons";

import * as ui from "@/ui/classes";

type AboutProjectAsideProps = {
  open: boolean;
  onClose: () => void;
};

const demonstratedFeatures = [
  "Full scheduling workflow from creation to publish",
  "Manual, bulk and automatic employee assignment",
  "Validation of staffing rules and constraints",
  "Role-based access for Admin, Employee and Viewer",
  "Realistic rules for rest time, overlaps and workload",
  "Department and position-based scheduling",
];

const demoSteps = [
  "Enter as Admin",
  "Create or open a weekly schedule",
  "Assign staff manually, with bulk assign or autofill",
  "Validate the schedule",
  "Publish it",
  "Switch to Employee or Viewer to explore the result",
];

const nextFeatures = [
  "Production authentication and account management",
  "Audit history for schedule changes",
  "Employees can request shift changes",
  "Admin notifications for requests and schedule events",
  "Employee notifications when schedules change",
  "Further autofill strategy improvements",
];

const outOfScope = [
  "Payroll",
  "Leave management",
  "Employee preference engine",
  "Full legal/compliance engine",
  "Hospital system integrations",
];

export default function AboutProjectAside({
  open,
  onClose,
}: AboutProjectAsideProps) {
  // Allow the drawer to be closed with Escape.
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-project-title"
        className="
          ml-auto flex h-full w-full max-w-[520px] flex-col
          border-l border-border bg-surface shadow-overlay
        "
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 p-7">
          <div className="flex items-center gap-3">
            <span
              className="
                flex h-10 w-10 shrink-0 items-center justify-center
                rounded-control bg-selected text-selected-foreground
              "
            >
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>

            <h2 id="about-project-title" className={ui.pageTitle}>
              About this project
            </h2>
          </div>

          <button
            type="button"
            className={ui.buttonGhost}
            onClick={onClose}
            aria-label="Close about this project"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 space-y-8 overflow-y-auto px-7 pb-8">
          <p className={ui.bodyMuted}>
            CareShift is a full-stack portfolio project built around hospital
            workforce scheduling.
          </p>

          <section className={ui.section}>
            <h3 className={ui.sectionTitle}>What it demonstrates</h3>

            <ul className="space-y-3">
              {demonstratedFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span
                    className="
                      mt-0.5 flex h-5 w-5 shrink-0 items-center
                      justify-center rounded-full
                      bg-success-muted text-success
                    "
                  >
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>

                  <span className={ui.bodyMuted}>{feature}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="border-t border-border pt-6">
            <h3 className={ui.sectionTitle}>Try it out</h3>

            <ol className="mt-4 space-y-3">
              {demoSteps.map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span
                    className="
                      flex h-5 w-5 shrink-0 items-center justify-center
                      rounded-full bg-selected text-xs font-semibold
                      text-selected-foreground
                    "
                  >
                    {index + 1}
                  </span>

                  <span className={ui.bodyMuted}>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="border-t border-border pt-6">
            <h3 className={ui.sectionTitle}>Next planned improvements</h3>

            <ul className="mt-4 space-y-2.5">
              {nextFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="mt-1 text-primary" aria-hidden="true">
                    •
                  </span>

                  <span className={ui.bodyMuted}>{feature}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="border-t border-border pt-6">
            <h3 className={ui.sectionTitle}>Deliberately out of scope</h3>

            <ul className="mt-4 space-y-2.5">
              {outOfScope.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <X
                    className="
                      mt-1 h-3.5 w-3.5 shrink-0
                      text-foreground-subtle
                    "
                    aria-hidden="true"
                  />

                  <span className={ui.bodyMuted}>{feature}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <footer className="grid grid-cols-2 gap-3 border-t border-border p-7">
          <a
            href="https://github.com/Bjoern-Rademacher/CareShift"
            target="_blank"
            rel="noreferrer"
            className={`${ui.button} flex items-center justify-center gap-2`}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 fill-current"
              aria-hidden="true"
            >
              <path d={siGithub.path} />
            </svg>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>

          <button
            type="button"
            className={`${ui.button} flex items-center justify-center gap-2`}
            disabled
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            Technical notes
          </button>
        </footer>
      </aside>
    </div>
  );
}
