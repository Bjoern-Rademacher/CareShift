"use client";

import { useEffect, useRef } from "react";

type Props = {
  logoutAction: () => Promise<void>;
};

export default function AutoLogout({ logoutAction }: Props) {
  const logoutStarted = useRef(false);

  useEffect(() => {
    if (logoutStarted.current) {
      return;
    }

    logoutStarted.current = true;

    void logoutAction();
  }, [logoutAction]);

  return (
    <main className="grid min-h-screen place-items-center bg-background">
      <p className="text-sm text-foreground-muted">
        Ending the previous demo session...
      </p>
    </main>
  );
}
