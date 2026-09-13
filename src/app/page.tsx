import { redirect } from "next/navigation";

import LandingPage from "@/app/landing/LandingPage";

import { getCurrentUser } from "@/lib/auth/currentUser";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
