import Link from "next/link";

import * as ui from "@/ui/classes";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <section className="w-full max-w-md rounded-card border border-border bg-surface p-6 text-center shadow-card">
        <h1 className={ui.pageTitle}>Login unavailable</h1>

        <p className={`${ui.bodyMuted} mt-2`}>
          This login page is currently disabled.
        </p>

        <Link href="/" className={`${ui.buttonPrimary} mt-6 inline-flex`}>
          Return to landing page
        </Link>
      </section>
    </main>
  );
}
