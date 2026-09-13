"use client";

import { useEffect } from "react";

import { AlertTriangle, RotateCcw } from "lucide-react";

import * as ui from "@/ui/classes";

type Props = {
  error: Error & {
    digest?: string;
  };

  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error("Application page failed to load", error);
  }, [error]);

  return (
    <div className={ui.page}>
      <section className="rounded-card border border-danger/40 bg-surface p-8 shadow-card">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="grid size-14 place-items-center rounded-full bg-danger-muted text-danger">
            <AlertTriangle className="size-6" aria-hidden="true" />
          </div>

          <h1 className={`${ui.pageTitle} mt-5`}>Page unavailable</h1>

          <p className={`${ui.bodyMuted} mt-2`}>
            The requested data could not be loaded.
          </p>

          <button
            type="button"
            onClick={reset}
            className={`${ui.buttonPrimary} mt-6 inline-flex items-center gap-2`}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Try again
          </button>

          {error.digest && (
            <p className={`${ui.caption} mt-4`}>Reference: {error.digest}</p>
          )}
        </div>
      </section>
    </div>
  );
}
