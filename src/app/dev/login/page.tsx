"use client";

import { useRouter } from "next/navigation";

type Role = "admin" | "employee" | "viewer";

async function devLogin(role: Role) {
  const res = await fetch("/api/dev/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });

  if (!res.ok) {
    throw new Error("Dev login failed");
  }
}

export default function DevLoginPage() {
  const router = useRouter();

  async function onPick(role: Role) {
    await devLogin(role);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Dev Login</h1>
      <p>Pick a role to set the dev session cookie.</p>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button onClick={() => onPick("admin")}>Login as Admin</button>
        <button onClick={() => onPick("employee")}>Login as Employee</button>
        <button onClick={() => onPick("viewer")}>Login as Viewer</button>
      </div>
    </main>
  );
}
