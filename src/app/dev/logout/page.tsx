"use client";

import { useRouter } from "next/navigation";

export default function DevLogoutPage() {
  const router = useRouter();

  async function handleLogout() {
    const res = await fetch("/api/dev/logout", {
      method: "POST",
    });

    if (!res.ok) {
      console.error("Logout failed");
      return;
    }

    router.push("/dev/login");
    router.refresh();
  }

  return (
    <main style={{ padding: "24px" }}>
      <h1>Dev Logout</h1>
      <p>This clears the dev session cookie.</p>

      <button onClick={handleLogout}>
        Logout
      </button>
    </main>
  );
}
