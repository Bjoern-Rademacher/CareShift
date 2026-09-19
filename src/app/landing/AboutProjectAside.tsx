"use client";

import { useEffect } from "react";

import { ArrowUpRight, Check, FileText, X } from "lucide-react";
import { siGithub } from "simple-icons";

import * as ui from "@/ui/classes";

type AboutProjectAsideProps = {
  open: boolean;
  onClose: () => void;
};

const coveredDemoFeatures = [
  "Complete workflow from schedule creation to re-editing",
  "Manual employee assignment and workload-balanced autofill",
  "Draft, validated and published schedule states",
  "Rules for overlaps, minimum rest and rolling seven-day workload",
  "Position and department-based assignment checks",
  "Role-specific access for Admin, Employee and Display users",
  "Client-side mutation locking and repeated backend validation",
];

const demoSteps = [
  "Enter as Admin",
  "Create or open a weekly department schedule",
  "Assign employees manually or use autofill",
  "Validate the completed assignments",
  "Publish the schedule",
  "Switch to Employee or Display to view the result",
  "Return the schedule to draft and make further changes",
];

const plannedFeatures = [
  "Demo data reset for a clean starting point",
  "Production-ready authentication and support for multiple employee accounts",
  "Schedule review and change requests for employees",
  "Notifications and messaging",
  "More advanced autofill and optimization strategies",
];

const futureDirection = [
  "Configurable scheduling rules and individual exceptions",
  "Employee availability and absence management",
];

export default function AboutProjectAside({
  open,
  onClose,
}: AboutProjectAsideProps) {
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
          <div className="space-y-3">
            <p className={ui.bodyMuted}>
              CareShift is a scheduling tool for hospital employees.
            </p>

            <p className={ui.bodyMuted}>
              It helps administrators create, assign, validate and publish
              weekly schedules. Published schedules can then be viewed through
              employee and display accounts.
            </p>
          </div>

          <section className={ui.section}>
            <h3 className={ui.sectionTitle}>What this demo covers</h3>

            <ul className="space-y-3">
              {coveredDemoFeatures.map((feature) => (
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
            <h3 className={ui.sectionTitle}>Try the workflow</h3>

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
            <h3 className={ui.sectionTitle}>Planned next steps</h3>

            <ul className="mt-4 space-y-3">
              {plannedFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span
                    className="
    mt-0.5 flex size-5 shrink-0 items-center justify-center
    rounded-full bg-emerald-950 text-emerald-300
    dark:bg-emerald-950 dark:text-emerald-300
  "
                    aria-hidden="true"
                  >
                    <ArrowUpRight className="size-3.5" />
                  </span>

                  <span className={ui.bodyMuted}>{feature}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="border-t border-border pt-6">
            <h3 className={ui.sectionTitle}>Future direction</h3>

            <ul className="mt-4 space-y-3">
              {futureDirection.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span
                    className="
    mt-0.5 flex size-5 shrink-0 items-center justify-center
    rounded-full bg-emerald-950 text-emerald-300
    dark:bg-emerald-950 dark:text-emerald-300
  "
                    aria-hidden="true"
                  >
                    <span className="size-1.5 rounded-full bg-current" />
                  </span>

                  <span className={ui.bodyMuted}>{feature}</span>
                </li>
              ))}
            </ul>
          </section>

          <p
            className={`
              border-t border-border pt-6
              ${ui.caption}
            `}
          >
            CareShift is a portfolio demonstration and has not been designed or
            certified for use with real medical or sensitive patient data.
          </p>
        </div>

        <footer className="border-t border-border p-7">
          <a
            href="https://github.com/Bjoern-Rademacher/CareShift"
            target="_blank"
            rel="noreferrer"
            className={`
              ${ui.button}
              flex w-full items-center justify-center gap-2
            `}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 fill-current"
              aria-hidden="true"
            >
              <path d={siGithub.path} />
            </svg>
            View project on GitHub
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </footer>
      </aside>
    </div>
  );
}
