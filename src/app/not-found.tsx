import Link from "next/link";

import { ArrowLeft, FileQuestion } from "lucide-react";

import * as ui from "@/ui/classes";

export default function NotFound() {
  return (
    <main
      className="
        grid min-h-[calc(100vh-1.5rem)]
        place-items-center p-6
      "
    >
      <section
        className="
          w-full max-w-lg rounded-card
          border border-border bg-surface
          p-8 text-center shadow-card
        "
      >
        <span
          aria-hidden="true"
          className="
            mx-auto grid size-14 place-items-center
            rounded-full bg-surface-muted
            text-foreground-muted
          "
        >
          <FileQuestion className="size-6" />
        </span>

        <p className={`${ui.caption} mt-5`}>Error 404</p>

        <h1 className={`${ui.pageTitle} mt-1`}>Page not found</h1>

        <p className={`${ui.bodyMuted} mt-2`}>
          The requested page does not exist or is no longer available.
        </p>

        <Link
          href="/"
          className={`${ui.buttonPrimary} mt-6 inline-flex items-center gap-2`}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Return home
        </Link>
      </section>
    </main>
  );
}
