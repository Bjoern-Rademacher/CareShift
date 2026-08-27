"use client";

import Image from "next/image";
import { useState } from "react";

import {
  ArrowRight,
  CalendarDays,
  Eye,
  LockKeyhole,
  Send,
  ShieldCheck,
  Sparkles,
  UserCog,
  UserRound,
  UsersRound,
} from "lucide-react";

import AboutProjectAside from "@/app/landing/AboutProjectAside";
import LandingHeroIllustration from "@/app/landing/LandingHeroIllustration";
import TechStack from "@/app/landing/TechStack";
import ThemeSwitch from "@/app/theme/ThemeSwitch";

import { login } from "@/lib/auth/login";

import * as ui from "@/ui/classes";

import type { Role } from "@/types/auth";

const workflow = [
  {
    icon: CalendarDays,
    title: "Create",
    description: "schedules",
    iconClass: "bg-selected text-selected-foreground",
  },
  {
    icon: UsersRound,
    title: "Assign",
    description: "staff",
    iconClass: "bg-success-muted text-success",
  },
  {
    icon: ShieldCheck,
    title: "Validate",
    description: "coverage & rules",
    iconClass: "bg-selected text-selected-foreground",
  },
  {
    icon: Send,
    title: "Publish",
    description: "with confidence",
    iconClass: "bg-warning-muted text-warning",
  },
];

const assignmentTools = [
  {
    icon: UsersRound,
    title: "Bulk assign",
    description: "Assign many recurring shifts at once.",
  },
  {
    icon: Sparkles,
    title: "Autofill",
    description:
      "Automatically fill open shifts while respecting scheduling rules.",
  },
];

const demoRoles = [
  {
    role: "ADMIN" as const,
    icon: UserCog,
    title: "Enter as Admin",
    description: "Full access to all features",
    iconClass: "bg-selected text-selected-foreground",
  },
  {
    role: "EMPLOYEE" as const,
    icon: UserRound,
    title: "View as Employee",
    description: "See your schedule",
    iconClass: "bg-success-muted text-success",
  },
  {
    role: "DISPLAY" as const,
    icon: Eye,
    title: "View as Display",
    description: "Read-only access",
    iconClass: "bg-surface-muted text-primary",
  },
];

export default function LandingPage() {
  const [aboutOpen, setAboutOpen] = useState(false);

  const [loadingRole, setLoadingRole] = useState<Role | null>(null);

  const [error, setError] = useState<string | null>(null);

  async function enterDemo(role: Role) {
    setError(null);
    setLoadingRole(role);

    try {
      const formData = new FormData();
      formData.set("role", role);

      await login(formData);
    } catch {
      setError("Could not start the demo.");
    } finally {
      setLoadingRole(null);
    }
  }

  return (
    <>
      <main className="mx-auto w-full max-w-[1500px] px-8 py-8">
        {/* Brand and project information */}
        <header className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <Image
              src="/CareShiftLogo.png"
              alt="CareShift"
              width={72}
              height={72}
              priority
              className="h-16 w-16 object-contain"
            />

            <div>
              <p className="text-3xl font-semibold tracking-tight text-foreground">
                CareShift
              </p>

              <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-foreground-muted">
                Hospital workforce scheduling
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSwitch />

            <button
              type="button"
              className={`${ui.buttonGhost} flex items-center gap-2`}
              onClick={() => setAboutOpen(true)}
            >
              About this project
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Hero */}
        <section className="mt-10 grid items-center gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <h1
              className="
                max-w-[650px] text-5xl font-semibold
                leading-[1.08] tracking-tight
                text-foreground lg:text-6xl
              "
            >
              Smarter scheduling.
              <br />
              Better care.
            </h1>

            <p className="mt-7 max-w-[620px] text-lg leading-8 text-foreground-muted">
              CareShift helps hospitals create, staff, validate and publish
              weekly schedules with confidence.
            </p>
          </div>

          <LandingHeroIllustration />
        </section>

        {/* Core scheduling lifecycle */}
        <section className="mt-4">
          <h2 className={ui.sectionTitle}>Core workflow</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {workflow.map((item, index) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="flex items-center gap-3">
                  <div
                    className="
                        flex min-w-0 flex-1
                        items-center gap-3
                        rounded-card border
                        border-border bg-surface
                        px-4 py-4 shadow-card
                      "
                  >
                    <span
                      className={`
                          flex h-11 w-11 shrink-0
                          items-center justify-center
                          rounded-control
                          ${item.iconClass}
                        `}
                    >
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>

                    <div>
                      <p className={ui.label}>{item.title}</p>

                      <p className={ui.caption}>{item.description}</p>
                    </div>
                  </div>

                  {index < workflow.length - 1 && (
                    <ArrowRight
                      className="
                          hidden h-5 w-5
                          shrink-0
                          text-foreground-subtle
                          lg:block
                        "
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Additional assignment features */}
        <section className="mt-8">
          <h2 className={ui.sectionTitle}>Assignment tools</h2>

          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {assignmentTools.map((tool) => {
              const Icon = tool.icon;

              return (
                <div
                  key={tool.title}
                  className="
                      flex items-center
                      justify-between gap-4
                      rounded-card border
                      border-border bg-surface
                      px-5 py-4 shadow-card
                      transition-colors
                      duration-fast
                      hover:bg-surface-hover
                    "
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="
                          flex h-10 w-10 shrink-0
                          items-center
                          justify-center
                          rounded-control
                          bg-selected
                          text-selected-foreground
                        "
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>

                    <div>
                      <p className={ui.label}>{tool.title}</p>

                      <p className={ui.caption}>{tool.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Demo access */}
        <section className="mt-9">
          <h2 className={ui.sectionTitle}>Jump in with a demo role</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {demoRoles.map((demoRole) => {
              const Icon = demoRole.icon;

              return (
                <button
                  key={demoRole.role}
                  type="button"
                  onClick={() => enterDemo(demoRole.role)}
                  disabled={loadingRole !== null}
                  className="
                      group flex items-center
                      justify-between gap-4
                      rounded-card border
                      border-border bg-surface
                      px-5 py-5 text-left
                      shadow-card
                      transition-colors
                      duration-fast
                      hover:bg-surface-hover
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-ring
                      disabled:border-disabled-border
                      disabled:bg-disabled-surface
                      disabled:text-disabled-foreground
                    "
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`
                          flex h-12 w-12 shrink-0
                          items-center
                          justify-center
                          rounded-full
                          ${demoRole.iconClass}
                        `}
                    >
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>

                    <div>
                      <p className={ui.label}>
                        {loadingRole === demoRole.role
                          ? "Opening..."
                          : demoRole.title}
                      </p>

                      <p className={ui.caption}>{demoRole.description}</p>
                    </div>
                  </div>

                  <ArrowRight
                    className="
                        h-5 w-5 shrink-0
                        text-primary
                        transition-transform
                        duration-fast
                        group-hover:translate-x-0.5
                      "
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex justify-center">
            <p className="flex items-center gap-2 text-sm text-foreground-muted">
              <LockKeyhole className="h-4 w-4" aria-hidden="true" />
              Demo data included · No account required
            </p>
          </div>

          {error && (
            <div className={`${ui.alertDanger} mx-auto mt-5 max-w-xl`}>
              {error}
            </div>
          )}
        </section>

        <TechStack />
      </main>

      <AboutProjectAside open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}
