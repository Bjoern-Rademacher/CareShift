"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import * as ui from "@/ui/classes";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.error ?? "Login failed");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Unexpected error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className={ui.page}>
      <section className={ui.section}>
        <form className={ui.card} onSubmit={handleSubmit}>
          <h1 className={ui.title}>ShiftPlanner Login</h1>

          <p className={ui.subtitle}>
            Sign in to manage schedules and assignments.
          </p>

          <label className="mt-6 block">
            <span>Email</span>

            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={ui.input}
            />
          </label>

          <label className="mt-4 block">
            <span>Password</span>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={ui.input}
            />
          </label>

          {error && <p className={ui.errorAlert}>{error}</p>}

          <button
            type="submit"
            className={`${ui.button} mt-6`}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}
